// Disposable one-hop Python reference probe; no recursive source crawl.
import {spawnSync} from 'node:child_process';
type Range={path:string;startLine:number;endLine:number};
type Excerpt=Range&{text:string;truncated:boolean};
export type ReferenceCandidate=Excerpt&{declarationEndLine:number;symbol:string;callers:Excerpt[]};
const parser=String.raw`import ast,json,sys,re
from pathlib import Path
args=json.load(sys.stdin);root=Path(args['root']).resolve()
remaining=args['budget'];read_bytes=0;cache={};unknown=[];edges={}
def load(name):
 global remaining,read_bytes
 if name in cache:return cache[name]
 try:
  logical=Path(name)
  excluded={'.git','.agents','.claude','.codex','node_modules','vendor','.venv','venv','__pycache__','dist','build','.cache','.pytest_cache'}
  if any(part in excluded for part in logical.parts) or logical.name.startswith('.env') or re.search(r'credential|secret|private[-_]?key|\.pem$|\.key$',logical.name,re.I):raise ValueError('reference file policy exclusion')
  path=(root/name).resolve();path.relative_to(root)
  if path.suffix not in ('.py','.pyi') or not path.is_file():raise ValueError('unavailable Python source')
  size=path.stat().st_size
  if size>1000000 or size>remaining:raise ValueError('source inspection budget')
  with path.open('rb') as stream:data=stream.read(min(1000000,remaining)+1)
  read_bytes+=len(data);remaining-=len(data)
  if len(data)>size or remaining<0:raise ValueError('source changed or exceeded budget')
  text=data.decode('utf-8')
  if '\0' in text or 'PRIVATE KEY-----' in text:raise ValueError('non-source content')
  cache[name]=(ast.parse(text),text.split('\n'));return cache[name]
 except (ValueError,OSError,SyntaxError,UnicodeError) as error:
  unknown.append({'path':name,'reason':str(error)[:160]});cache[name]=None;return None

def declaration(tree,symbol):
 for node in tree.body:
  if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef)) and node.name==symbol:return node
  if isinstance(node,(ast.Assign,ast.AnnAssign)):
   targets=node.targets if isinstance(node,ast.Assign) else [node.target]
   if any(isinstance(n,ast.Name) and isinstance(n.ctx,ast.Store) and n.id==symbol for target in targets for n in ast.walk(target)):return node
 return None

def excerpt(lines,start,end,max_bytes):
 result=[];size=0
 for line in lines[start-1:end]:
  cost=len(line.encode())+(1 if result else 0)
  if size+cost>max_bytes:break
  result.append(line);size+=cost
 return {'startLine':start,'endLine':start+len(result)-1,'text':'\n'.join(result),'truncated':len(result)<end-start+1}

# Conservative lexical resolution: uncertain bindings are reported, not followed.
scopes=(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef,ast.Lambda,ast.ListComp,ast.SetComp,ast.DictComp,ast.GeneratorExp)
def local_bindings(scope):
 bound=set();global_names=set()
 def visit(node):
  if node is not scope and isinstance(node,scopes):
   if hasattr(node,'name'):bound.add(node.name)
   return
  if isinstance(node,ast.Name) and isinstance(node.ctx,(ast.Store,ast.Del)):bound.add(node.id)
  if isinstance(node,ast.arg):bound.add(node.arg)
  if isinstance(node,(ast.Import,ast.ImportFrom)):
   bound.update(a.asname or a.name.split('.')[0] for a in node.names)
  if isinstance(node,ast.ExceptHandler) and node.name:bound.add(node.name)
  if isinstance(node,ast.Global):global_names.update(node.names)
  if isinstance(node,ast.Nonlocal):bound.update(node.names)
  if type(node).__name__ in ('MatchAs','MatchStar') and node.name:bound.add(node.name)
  for child in ast.iter_child_nodes(node):visit(child)
 visit(scope)
 return bound-global_names

def shadowed(node,parents,bindings):
 current=parents.get(node);inside_function=False
 while current is not None:
  if isinstance(current,scopes):
   if not (inside_function and isinstance(current,ast.ClassDef)) and node.id in bindings[id(current)]:return True
   if isinstance(current,(ast.FunctionDef,ast.AsyncFunctionDef,ast.Lambda)):inside_function=True
  current=parents.get(current)
 return False

def module_bindings(tree):
 counts={}
 def add(name):counts[name]=counts.get(name,0)+1
 def visit(node):
  if isinstance(node,scopes):
   if hasattr(node,'name'):add(node.name)
   return
  if isinstance(node,ast.Name) and isinstance(node.ctx,(ast.Store,ast.Del)):add(node.id)
  if isinstance(node,(ast.Import,ast.ImportFrom)):
   for alias in node.names:add(alias.asname or alias.name.split('.')[0])
  if isinstance(node,ast.ExceptHandler) and node.name:add(node.name)
  if type(node).__name__ in ('MatchAs','MatchStar') and node.name:add(node.name)
  for child in ast.iter_child_nodes(node):visit(child)
 visit(tree)
 return counts

groups={}
for item in args['selected']:groups.setdefault(item['path'],[]).append(item)
for name,ranges in sorted(groups.items()):
 if not name.endswith(('.py','.pyi')):continue
 loaded=load(name)
 if not loaded:continue
 tree,lines=loaded
 module_counts=module_bindings(tree)
 uncertain_names={n.target.id for n in ast.walk(tree) if isinstance(n,ast.NamedExpr) and isinstance(n.target,ast.Name)}
 parents={child:parent for parent in ast.walk(tree) for child in ast.iter_child_nodes(parent)}
 bindings={id(node):local_bindings(node) for node in ast.walk(tree) if isinstance(node,scopes)}
 imports={}
 for node in tree.body:
  if not isinstance(node,ast.ImportFrom):continue
  package=list(Path(name).parent.parts)
  if node.level:
   if node.level>len(package):continue
   module=package[:len(package)-node.level+1]+(node.module.split('.') if node.module else [])
  else:module=node.module.split('.') if node.module else []
  for alias in node.names:
   if alias.name=='*':continue
   imports[alias.asname or alias.name]=(module,alias.name,node.module is None)
 for node in ast.walk(tree):
  if not isinstance(node,ast.Name) or not isinstance(node.ctx,ast.Load):continue
  callers=[item for item in ranges if item['startLine']<=node.lineno<=item['endLine']]
  if not callers:continue
  if node.id not in module_counts:continue
  if node.id in uncertain_names:
   unknown.append({'path':name,'symbol':node.id,'reason':'assignment expression binding not resolved'});continue
  if module_counts.get(node.id)!=1:
   unknown.append({'path':name,'symbol':node.id,'reason':'ambiguous module binding'});continue
  if shadowed(node,parents,bindings):
   unknown.append({'path':name,'symbol':node.id,'reason':'local or nonlocal binding; module dependency not inferred'});continue
  symbol=node.id;target_name=name;target_tree=tree;target_lines=lines
  if symbol in imports:
   module,symbol,is_module=imports[symbol]
   if is_module:
    unknown.append({'path':name,'symbol':node.id,'reason':'module reference needs member resolution'});continue
   paths=[Path(*module).with_suffix('.py'),Path(*module)/'__init__.py'] if module else []
   target=next((p for p in paths if (root/p).is_file()),None)
   if target is None:
    unknown.append({'path':name,'symbol':node.id,'reason':'local import source unavailable'});continue
   target_name=target.as_posix();target_loaded=load(target_name)
   if not target_loaded:continue
   target_tree,target_lines=target_loaded
  if target_name!=name and module_bindings(target_tree).get(symbol)!=1:
   unknown.append({'path':target_name,'symbol':symbol,'reason':'ambiguous or unavailable target binding'});continue
  decl=declaration(target_tree,symbol)
  if decl is None:
   unknown.append({'path':target_name,'symbol':symbol,'reason':'declaration unavailable; conditional definitions and reexports not followed'});continue
  start=min([decl.lineno]+[d.lineno for d in getattr(decl,'decorator_list',[])])
  end=decl.end_lineno
  if target_name==name and start<=node.lineno<=end:continue
  key=(target_name,symbol,start,end)
  if key not in edges:
   part=excerpt(target_lines,start,end,14000)
   if not part['text']:
    unknown.append({'path':target_name,'symbol':symbol,'reason':'declaration opening line exceeds excerpt budget'});continue
   edges[key]={'path':target_name,'symbol':symbol,'declarationEndLine':end,**part,'callers':[]}
  for caller in callers:
   if not 1<=caller['startLine']<=caller['endLine']<=len(lines):
    unknown.append({'path':name,'symbol':node.id,'reason':'caller range outside current source'});continue
   part={'path':name,**excerpt(lines,caller['startLine'],caller['endLine'],6000)}
   if not part['text'] or node.lineno>part['endLine']:
    unknown.append({'path':name,'symbol':node.id,'reason':'caller evidence omitted by excerpt bound'});continue
   if part not in edges[key]['callers'] and len(edges[key]['callers'])<3:edges[key]['callers'].append(part)
print(json.dumps({'candidates':[edge for edge in edges.values() if edge['callers']],'unknown':list({json.dumps(x,sort_keys=True):x for x in unknown}.values()),'readBytes':read_bytes,'oneHop':True}))
`;
export function referenceContext(root:string,selected:Range[],budget:number):{candidates:ReferenceCandidate[];unknown:Record<string,unknown>[];readBytes:number|null;oneHop:boolean}{
 const result=spawnSync('python3',['-c',parser],{input:JSON.stringify({root,selected,budget}),encoding:'utf8',timeout:15000,maxBuffer:16_000_000});
 if(result.status!==0)return{candidates:[],unknown:[{reason:'reference parser unavailable, failed, or exceeded resource guard'}],readBytes:null,oneHop:true};
 try{return JSON.parse(result.stdout);}catch{return{candidates:[],unknown:[{reason:'invalid reference parser result'}],readBytes:null,oneHop:true};}
}
