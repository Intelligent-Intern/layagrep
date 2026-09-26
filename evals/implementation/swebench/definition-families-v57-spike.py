"""Group candidate methods through same-file declared inheritance.
This is source structure, not resolved runtime dispatch or import binding.
"""
import ast
from collections import defaultdict

def families(documents,candidates):
    classes=defaultdict(list);methods=set();edges=[];unresolved=[];skipped=[];headers={};lookup_scopes={}
    paths=set()
    for doc in sorted(documents,key=lambda d:d['path']):
        path=doc['path']
        if path in paths:raise ValueError('Duplicate document')
        paths.add(path)
        if not path.endswith(('.py','.pyi')):skipped.append({'path':path,'reason':'non-Python'});continue
        try:tree=ast.parse(doc['text'])
        except (SyntaxError,ValueError,RecursionError) as e:skipped.append({'path':path,'reason':type(e).__name__});continue
        parents={child:node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
        def qualified(node):
            names=[]
            while node is not None:
                if isinstance(node,(ast.ClassDef,ast.FunctionDef,ast.AsyncFunctionDef)):names.append(node.name)
                node=parents.get(node)
            return '.'.join(reversed(names))
        raw=doc['text'].encode();offsets=[0]
        for line in raw.splitlines(keepends=True):offsets.append(offsets[-1]+len(line))
        for node in ast.walk(tree):
            if isinstance(node,ast.ClassDef):
                name=qualified(node);classes[path,name].append(node)
                scopes=[];ancestor=parents.get(node)
                while ancestor is not None:
                    if isinstance(ancestor,(ast.ClassDef,ast.FunctionDef,ast.AsyncFunctionDef)):
                        if not scopes or isinstance(ancestor,(ast.FunctionDef,ast.AsyncFunctionDef)):scopes.append(qualified(ancestor))
                    ancestor=parents.get(ancestor)
                lookup_scopes[path,name]=scopes+['']
                a=offsets[node.lineno-1]+node.col_offset;first=node.body[0];b=offsets[first.lineno-1]+first.col_offset
                headers[path,name]={'path':path,'symbol':name,'sourceByteStart':a,'sourceByteEnd':b,'text':raw[a:b].decode()}
            elif isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef)) and isinstance(parents.get(node),ast.ClassDef):methods.add((path,qualified(node)))
    parent={key:key for key,nodes in classes.items() if len(nodes)==1}
    def find(key):
        while parent[key]!=key:parent[key]=parent[parent[key]];key=parent[key]
        return key
    for key,nodes in sorted(classes.items()):
        path,name=key
        if len(nodes)!=1:unresolved.append({'path':path,'derived':name,'reason':'repeated qualified class name'});continue
        for base in nodes[0].bases:
            if not isinstance(base,ast.Name):unresolved.append({'path':path,'derived':name,'base':ast.unparse(base),'reason':'non-name base expression'});continue
            target=None
            for scope in lookup_scopes[key]:
                candidate=(path,(scope+'.' if scope else '')+base.id)
                if candidate in classes:
                    if candidate in parent:target=candidate
                    break
            if target is None or target==key:unresolved.append({'path':path,'derived':name,'base':base.id,'reason':'base not uniquely represented in same-file class declarations'});continue
            edges.append({'path':path,'derived':name,'base':target[1],'source':headers[key],'runtime_binding_unverified':True});parent[find(key)]=find(target)
    buckets=defaultdict(list);ids=set()
    for c in candidates:
        if c['id'] in ids:raise ValueError('Duplicate candidate')
        ids.add(c['id']);symbol=c['symbol'];owner,_,method=symbol.rpartition('.');key=(c['path'],owner)
        group=('family',*find(key),method) if (c['path'],symbol) in methods and key in parent else ('singleton',c['id'])
        buckets[group].append(c['id'])
    groups=[{'id':'family-'+str(i),'members':sorted(members),'basis':'same-file declared inheritance' if key[0]=='family' and len(members)>1 else 'singleton','runtime_dispatch_unknown':True} for i,(key,members) in enumerate(sorted(buckets.items()))]
    return {'families':groups,'inheritance_edges':edges,'unresolved_bases':unresolved,'skipped':skipped,'scope':'Same-file source-declared inheritance only; dynamic binding, receiver identity and cross-file bases remain unverified.'}
