// Disposable Python declaration probe. Parser packaging is deferred until architecture selection.
import {spawnSync} from 'node:child_process';
const parser=String.raw`
import ast,json,sys
source=json.load(sys.stdin)
tree=ast.parse(source)
lines=source.split('\n')
boundaries={0,len(lines)}
classes=[]
def declarations(nodes):
    for node in nodes:
        if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef)):
            start=min([node.lineno]+[d.lineno for d in node.decorator_list])-1
            boundaries.add(start)
            end=getattr(node,'end_lineno',None)
            if end is not None: boundaries.add(end)
            if isinstance(node,ast.ClassDef):
                # A header range includes decorators, bases, and the class docstring.
                first=node.body[0]
                header_end=max(node.lineno,first.lineno-1)
                if isinstance(first,ast.Expr) and isinstance(getattr(first.value,'value',getattr(first.value,'s',None)),str):
                    header_end=getattr(first,'end_lineno',None)
                if end is None or header_end is None:
                    raise ValueError('Parser cannot locate class context exactly')
                classes.append({'start':start,'end':end,'headerEnd':header_end})
                declarations(node.body)
declarations(tree.body)
print(json.dumps({'boundaries':sorted(boundaries),'classes':classes}))
`;
type Context={startLine:number;endLine:number;text:string};
export function sourceUnits(path:string,text:string){
 const lines=text.split('\n');let boundaries=[0,lines.length];let method='line-windows';let fallback:string|undefined;
 let classes:{start:number;end:number;headerEnd:number}[]=[];
 if(path.endsWith('.py')||path.endsWith('.pyi')){
  const parsed=spawnSync('python3',['-c',parser],{input:JSON.stringify(text),encoding:'utf8',timeout:5000,maxBuffer:1_000_000});
  if(parsed.status===0){
   try{const value=JSON.parse(parsed.stdout),values=value.boundaries;
    if(!Array.isArray(values)||values[0]!==0||values.at(-1)!==lines.length||values.some((v,i)=>!Number.isInteger(v)||v<0||v>lines.length||(i>0&&v<=values[i-1])))throw new Error('Invalid boundaries');
    if(!Array.isArray(value.classes)||value.classes.some(c=>![c.start,c.end,c.headerEnd].every(Number.isInteger)||c.start<0||c.end>lines.length||c.headerEnd<=c.start||c.headerEnd>c.end))throw new Error('Invalid class context');
    boundaries=values;classes=value.classes;method='python-declarations';
   }catch{fallback='invalid parser result';}
  }else fallback='Python parser unavailable or source could not be parsed';
 }
 const parts:{startLine:number;endLine:number;text:string;contexts?:Context[]}[]=[];
 for(let index=0;index<boundaries.length-1;index++){
  let cursor=boundaries[index]!;const end=boundaries[index+1]!;
  while(cursor<end){let stop=cursor,bytes=0;
   while(stop<end&&(bytes+Buffer.byteLength(lines[stop]!)+1<=3500||stop===cursor)){bytes+=Buffer.byteLength(lines[stop]!)+1;stop++;}
   const chunk=lines.slice(cursor,stop).join('\n');
   const contexts=classes.filter(c=>cursor>=c.headerEnd&&stop<=c.end).map(c=>({startLine:c.start+1,endLine:c.headerEnd,text:lines.slice(c.start,c.headerEnd).join('\n')}));
   if(chunk.trim())parts.push({startLine:cursor+1,endLine:stop,text:chunk,...(contexts.length?{contexts}:{})});
   cursor=stop;
  }
 }
 return {parts,method,fallback};
}
