"""One-hop name lookup from visible calls, within supplied admitted Python files.
Matches are possible definitions, never claims about runtime dispatch or relevance.
"""
import ast,unicodedata
from collections import defaultdict

def expand(documents,max_file_bytes=1_000_000,max_definition_bytes=12000,max_edges=100000):
    if max_file_bytes<0 or max_definition_bytes<4 or max_edges<0:raise ValueError('Invalid diagnostic bounds')
    by_name=defaultdict(list);calls=[];skipped=[];seen_paths=set()
    for doc in sorted(documents,key=lambda d:d['path']):
        path=doc['path']
        if path in seen_paths:raise ValueError('Duplicate document')
        seen_paths.add(path);raw=doc['text'].encode();ranges=doc['seed_ranges'];visible=doc['visible_ranges']
        for a,b in ranges+visible:
            if not 0<=a<=b<=len(raw):raise ValueError('Invalid source range')
        if not path.endswith(('.py','.pyi')):skipped.append({'path':path,'reason':'non-Python source'});continue
        if len(raw)>max_file_bytes:skipped.append({'path':path,'reason':'file inspection guard'});continue
        try:tree=ast.parse(doc['text'])
        except (SyntaxError,ValueError,RecursionError) as e:skipped.append({'path':path,'reason':type(e).__name__});continue
        lines=raw.splitlines(keepends=True);offsets=[0]
        for line in lines:offsets.append(offsets[-1]+len(line))
        def pos(line,column=0):return offsets[line-1]+column
        parents={child:node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
        for node in ast.walk(tree):
            if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef)):
                names=[node.name];parent=parents.get(node)
                while parent is not None:
                    if isinstance(parent,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef)):names.append(parent.name)
                    parent=parents.get(parent)
                start_line=min([node.lineno]+[d.lineno for d in node.decorator_list]);a=pos(start_line);b=pos(node.end_lineno,node.end_col_offset)
                by_name[node.name].append({'path':path,'symbol':'.'.join(reversed(names)),'startLine':start_line,'endLine':node.end_lineno,'sourceByteStart':a,'sourceByteEnd':b,'raw':raw,'visible':visible})
            if not isinstance(node,ast.Call) or not isinstance(node.func,(ast.Name,ast.Attribute)):continue
            name=node.func.id if isinstance(node.func,ast.Name) else node.func.attr
            b=pos(node.func.end_lineno,node.func.end_col_offset)
            prefix=raw[pos(node.func.end_lineno):b].decode();chars=[]
            for char in reversed(prefix):
                if not ('_'+char).isidentifier():break
                chars.append(char)
            spelling=''.join(reversed(chars));a=b-len(spelling.encode())
            if unicodedata.normalize('NFKC',spelling)!=name:raise ValueError('Identifier source does not match parsed name')
            if not any(lo<=a and b<=hi for lo,hi in ranges):continue
            calls.append({'path':path,'name':name,'spelling':spelling,'line':node.func.end_lineno,'sourceByteStart':a,'sourceByteEnd':b,'runtime_dispatch_unknown':True})
    definitions={};covered={};unresolved=[];edges=0;guard=False
    for call in sorted(calls,key=lambda c:(c['path'],c['sourceByteStart'])):
        matches=by_name.get(call['name'],[])
        if not matches:unresolved.append(call);continue
        for target in matches:
            if edges>=max_edges:guard=True;break
            edges+=1;a=target['sourceByteStart'];b=target['sourceByteEnd'];key=(target['path'],a,b)
            # Only whitespace missing from a definition is not new semantic source.
            cursor=a;unseen=[]
            for lo,hi in sorted(target['visible']):
                if hi<=cursor or lo>=b:continue
                if lo>cursor:unseen.append(target['raw'][cursor:min(lo,b)])
                cursor=max(cursor,min(hi,b))
            if cursor<b:unseen.append(target['raw'][cursor:b])
            destination=definitions if b''.join(unseen).strip() else covered
            if key not in destination:
                end=min(b,a+max_definition_bytes)
                while end<b and end>a and target['raw'][end]&0xc0==0x80:end-=1
                text=target['raw'][a:end].decode()
                record={k:v for k,v in target.items() if k not in ('raw','visible')}
                record.update(sourceByteEnd=end,declarationByteEnd=b,endLine=target['startLine']+text.count('\n'),text=text,truncated=end<b,runtime_dispatch_unknown=True,unseen_bytes=sum(map(len,unseen)),evidence=[])
                destination[key]=record
            destination[key]['evidence'].append(call)
        if guard:break
    return {'definitions':list(definitions.values()),'already_visible':list(covered.values()),'unresolved_calls':unresolved,'skipped':skipped,'examined_edges':edges,'edge_guard_reached':guard,'visible_calls':calls,'scope':'One-hop name matches within supplied files only. Runtime dispatch, import binding and relevance are unverified; unseen files remain unknown.'}
