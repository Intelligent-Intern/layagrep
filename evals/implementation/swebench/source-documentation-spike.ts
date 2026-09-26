// Layout metadata only: these ranges never affect Jev's relevance questions.
import {spawnSync} from 'node:child_process';
export type DocumentationRange={startLine:number;endLine:number};
const parser=String.raw`
import ast,json,sys
text=json.load(sys.stdin);lines=text.split('\n');tree=ast.parse(text);docs=set()
for node in ast.walk(tree):
 if not isinstance(node,(ast.Module,ast.ClassDef,ast.FunctionDef,ast.AsyncFunctionDef)) or not node.body:continue
 first=node.body[0]
 if not isinstance(first,ast.Expr) or not isinstance(getattr(first.value,'value',getattr(first.value,'s',None)),str):continue
 selected=set(range(first.lineno,first.end_lineno+1))
 # Keep a mixed statement intact instead of moving only part of its string.
 if lines[first.lineno-1].encode()[:first.col_offset].strip():continue
 if lines[first.end_lineno-1].encode()[first.end_col_offset:].strip():continue
 docs.update(selected)
ranges=[]
for line in sorted(docs):
 if ranges and ranges[-1]['endLine']==line-1:ranges[-1]['endLine']=line
 else:ranges.append({'startLine':line,'endLine':line})
print(json.dumps(ranges))
`;
export function documentationRanges(path:string,text:string,startLine=1):{ranges:DocumentationRange[];method:string;reason?:string}{
 if(!path.endsWith('.py')&&!path.endsWith('.pyi'))return{ranges:[],method:'unchanged-non-python'};
 const parsed=spawnSync('python3',['-c',parser],{input:JSON.stringify(text),encoding:'utf8',timeout:5000,maxBuffer:1_000_000});
 if(parsed.status!==0)return{ranges:[],method:'unavailable',reason:'Python documentation layout unavailable; docstrings not separated'};
 try{
  const ranges=JSON.parse(parsed.stdout);const count=text.split('\n').length;
  if(!Array.isArray(ranges)||ranges.some(r=>!Number.isInteger(r.startLine)||!Number.isInteger(r.endLine)||r.startLine<1||r.endLine<r.startLine||r.endLine>count))throw new Error('Invalid documentation ranges');
  return{ranges:ranges.map(r=>({startLine:r.startLine+startLine-1,endLine:r.endLine+startLine-1})),method:'python-docstrings'};
 }catch{return{ranges:[],method:'unavailable',reason:'Invalid documentation layout; docstrings not separated'};}
}
