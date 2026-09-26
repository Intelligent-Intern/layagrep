"""Disposable evidence-selection probe over source already encountered by retrieval."""
import ast,re,json,sys
from collections import defaultdict,deque

OPERATORS={'Add':'add','Sub':'sub','Mult':'mul','Div':'truediv','FloorDiv':'floordiv','Mod':'mod','Pow':'pow','MatMult':'matmul','BitAnd':'and','BitOr':'or','BitXor':'xor','LShift':'lshift','RShift':'rshift'}

def discover(data,max_hops=2,max_edges=100000):
    if not isinstance(max_hops,int) or not 0<=max_hops<=2:raise ValueError('Prototype supports zero to two hops')
    if not isinstance(max_edges,int) or max_edges<0:raise ValueError('Invalid edge budget')
    terms=set(re.findall(r'[A-Za-z_][A-Za-z_0-9]*',data['query']))
    declarations=[];by_name=defaultdict(list);skipped=[]
    for document in sorted(data['documents'],key=lambda d:d['path']):
        try:tree=ast.parse(document['text'])
        except SyntaxError:
            skipped.append({'path':document['path'],'reason':'unparseable source'});continue
        parents={child:parent for parent in ast.walk(tree) for child in ast.iter_child_nodes(parent)}
        ids={};lines=document['text'].splitlines()
        for node in ast.walk(tree):
            if not isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef)):continue
            ancestors=[];p=parents.get(node)
            while p is not None:
                if isinstance(p,(ast.ClassDef,ast.FunctionDef,ast.AsyncFunctionDef)):ancestors.append(p.name)
                p=parents.get(p)
            identity=(document['path'],node.lineno,node.name)
            record={'tree':tree,'id':identity,'path':document['path'],'node':node,'parents':parents,'ids':ids,'lines':lines,'name':node.name,'qualified':'.'.join([*reversed(ancestors),node.name]),'ancestor_names':ancestors}
            declarations.append(record);by_name[node.name].append(record);ids[id(node)]=record
    anchors=[];anchor_ids=set()
    for d in declarations:
        if d['name'] not in terms:continue
        # A queried class supplies inspection seeds, not an execution edge to every method.
        seeds=[d,*[d['ids'][id(n)] for n in d['node'].body if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef))]] if isinstance(d['node'],ast.ClassDef) else [d]
        for seed in seeds:
            if seed['id'] not in anchor_ids:anchor_ids.add(seed['id']);anchors.append(seed)
    anchors.sort(key=lambda d:(-(d['name'] in terms),-sum(n in terms for n in d['ancestor_names']),isinstance(d['node'],ast.ClassDef),d['path'],d['node'].lineno))
    candidates={};seen_contexts=defaultdict(set);seen_targets=defaultdict(set);edges=0;truncated=False;unresolved=set()
    def retain(target, chain):
        path=target['path']
        bucket=candidates.setdefault(path,{'relatedContext':[], 'declarations':[], 'omitted_context_ranges':0, 'omitted_declarations':0, 'context_bytes':0, 'declaration_bytes':0})
        for caller in chain:
            key=(caller['path'],caller['startLine'],caller['endLine'])
            if key in seen_contexts[path]:continue
            seen_contexts[path].add(key)
            cost=len(json.dumps(caller,ensure_ascii=False).encode())
            if bucket['context_bytes']+cost>8000:
                bucket['omitted_context_ranges']+=1;continue
            bucket['relatedContext'].append(caller);bucket['context_bytes']+=cost
        if target['id'] in seen_targets[path]:return
        seen_targets[path].add(target['id'])
        node=target['node'];start=min([node.lineno,*[d.lineno for d in node.decorator_list]])
        raw='\n'.join(target['lines'][start-1:node.end_lineno]);encoded=raw.encode()
        text=encoded[:12000].decode('utf-8',errors='ignore')
        record={'path':path,'symbol':target['qualified'],'startLine':start,'endLine':start+text.count('\n'),'declarationEndLine':node.end_lineno,'text':text,'truncated':len(encoded)>12000,'not_verified_runtime_dispatch':True}
        cost=len(json.dumps(record,ensure_ascii=False).encode())
        if bucket['declaration_bytes']+cost>16000:
            bucket['omitted_declarations']+=1;return
        bucket['declarations'].append(record);bucket['declaration_bytes']+=cost
    def references(d,root=False):
        if isinstance(d['node'],ast.ClassDef) and not root:return
        stack=[d['node']]
        while stack:
            node=stack.pop()
            if node is not d['node'] and isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef,ast.Lambda)):continue
            stack.extend(reversed(list(ast.iter_child_nodes(node))))
            names=[];kind='name-match';targets=None
            if isinstance(node,ast.Call) and isinstance(node.func,ast.Name):
                # Bare names cannot dispatch to unrelated methods or dormant nested functions.
                name=node.func.id
                visible_scopes={d['qualified']}
                parent=d['parents'].get(d['node'])
                while parent is not None:
                    if isinstance(parent,(ast.FunctionDef,ast.AsyncFunctionDef)):
                        visible_scopes.add(d['ids'][id(parent)]['qualified'])
                    parent=d['parents'].get(parent)
                targets=(t for t in by_name.get(name,[]) if not t['ancestor_names'] or (t['path']==d['path'] and t['qualified'].rsplit('.',1)[0] in visible_scopes))
            elif isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute):
                name=node.func.attr;value=node.func.value;kind='possible-attribute-call'
                if isinstance(value,ast.Name) and value.id in ('self','cls') and d['ancestor_names']:
                    parent=d['qualified'].rsplit('.',1)[0]
                    targets=(t for t in by_name.get(name,[]) if t['path']==d['path'] and t['qualified']==parent+'.'+name)
                elif isinstance(value,ast.Call) and isinstance(value.func,ast.Name):
                    receiver=value.func.id
                    targets=(t for t in by_name.get(name,[]) if t['qualified']==receiver+'.'+name)
                elif isinstance(value,ast.Name):
                    imports={a.asname or a.name.split('.')[0]:a.name for n in d['tree'].body if isinstance(n,ast.Import) for a in n.names}
                    for n in d['tree'].body:
                        if isinstance(n,ast.ImportFrom) and n.module and n.level==0:
                            imports.update({a.asname or a.name:n.module+'.'+a.name for a in n.names})
                    module=imports.get(value.id)
                    if module:
                        suffix=module.replace('.','/')
                        targets=(t for t in by_name.get(name,[]) if t['path'] in (suffix+'.py',suffix+'/__init__.py') or t['path'].endswith('/'+suffix+'.py'))
                if targets is None:
                    unresolved.add((d['path'],node.lineno,name,'attribute receiver not resolved from observed source'));continue
            elif isinstance(node,ast.BinOp) and type(node.op).__name__ in OPERATORS:
                op=OPERATORS[type(node.op).__name__];names=[f'__{op}__',f'__r{op}__'];kind='possible-operator-dispatch'
            if targets is None and not names:continue
            if targets is None:targets=(target for name in names for target in by_name.get(name,[]))
            declaration_start=min([d['node'].lineno,*[x.lineno for x in d['node'].decorator_list]])
            start=max(declaration_start,node.lineno-8);end=min(d['node'].end_lineno,node.end_lineno+8)
            if isinstance(d['node'],(ast.FunctionDef,ast.AsyncFunctionDef)):
                full_start=min([d['node'].lineno]+[n.lineno for n in d['node'].decorator_list]);full_end=d['node'].end_lineno
                if len('\n'.join(d['lines'][full_start-1:full_end]).encode())<=1800:start,end=full_start,full_end
            evidence={'path':d['path'],'startLine':start,'endLine':end,'text':'\n'.join(d['lines'][start-1:end]).encode()[:1800].decode('utf-8',errors='ignore'),'truncated':len('\n'.join(d['lines'][start-1:end]).encode())>1800,'symbol':d['qualified'],'relationship':kind,'not_verified_runtime_dispatch':True}
            found=False
            for target in targets:
                if edges>=max_edges:return
                found=True;yield target,evidence
            if not found and isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute):
                unresolved.add((d['path'],node.lineno,node.func.attr,'no observed receiver-qualified target'))
    for anchor in anchors:
        queue=deque([(anchor,[])]);visited={anchor['id']}
        while queue:
            current,chain=queue.popleft()
            if len(chain)>=max_hops:continue
            if edges>=max_edges:truncated=True;break
            for target,caller in references(current,root=not chain):
                edges+=1
                next_chain=[*chain,caller]
                retain(target,next_chain)
                if target['id'] not in visited:
                    visited.add(target['id']);queue.append((target,next_chain))
                if edges>=max_edges:truncated=True;break
            if truncated:break
        if truncated:break
    return {'anchors':[{'path':d['path'],'symbol':d['qualified']} for d in anchors],'candidates':dict(candidates),'examined_edges':edges,'edge_guard_reached':truncated,'skipped':skipped,'unresolved_attributes':[{'path':p,'line':line,'name':name,'reason':reason} for p,line,name,reason in sorted(unresolved)],'scope':'Possible name/operator links within observed source only; ambiguous names are candidates, not proven calls. No additional filesystem traversal.'}

if __name__=='__main__':json.dump(discover(json.load(sys.stdin)),sys.stdout)
