import {packSource} from './source-packet-spike';
import type {DocumentationRange} from './source-documentation-spike';
type Snippets=Parameters<typeof packSource>[0];
type Fragment={path:string;startLine:number;endLine:number;text:string;documentation:boolean};
export function packCodeFirst(snippets:Snippets,budget:number,documentation:ReadonlyMap<string,readonly DocumentationRange[]>){
 // Whole-file mode preserves its existing complete-file contract.
 if(snippets.some(s=>s.startLine===undefined))return packSource(snippets,budget);
 const seen=new Map<string,Map<number,string>>();const fragments:Fragment[]=[];
 for(const snippet of [...snippets].sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path)||(a.startLine??0)-(b.startLine??0))){
  let known=seen.get(snippet.path);if(!known){known=new Map();seen.set(snippet.path,known);}
  const ranges=documentation.get(snippet.path)??[];
  for(const span of [...(snippet.contexts??[]),{startLine:snippet.startLine!,endLine:snippet.endLine!,text:snippet.text}]){
   const lines=span.text.split('\n');if(lines.length!==span.endLine-span.startLine+1)throw new Error('Source range does not match text');
   let group:string[]=[],start=0,bytes=0,role=false;
   const flush=()=>{if(group.length)fragments.push({path:snippet.path,startLine:start,endLine:start+group.length-1,text:group.join('\n'),documentation:role});group=[];bytes=0;};
   for(let offset=0;offset<lines.length;offset++){
    const number=span.startLine+offset,line=lines[offset]!;
    if(known.has(number)&&known.get(number)!==line)throw new Error('Conflicting source line');
    const doc=ranges.some(r=>number>=r.startLine&&number<=r.endLine),size=Buffer.byteLength(line)+1;
    if(group.length&&(role!==doc||bytes+size>3500))flush();
    if(!group.length){start=number;role=doc;}
    group.push(line);bytes+=size;known.set(number,line);
   }
   flush();
  }
 }
 let source='',documentationStarted=false;
 const delivered:{path:string;startLine:number;endLine:number}[]=[];
 const omissions:Record<string,unknown>[]=[];
 const admitted=new Map<string,Set<number>>();
 function remaining(fragment:Fragment):Fragment[]{
  const known=admitted.get(fragment.path),lines=fragment.text.split('\n'),result:Fragment[]=[];
  let start=0;
  for(let i=0;i<=lines.length;i++){
   if(i<lines.length&&!known?.has(fragment.startLine+i))continue;
   if(i>start)result.push({...fragment,startLine:fragment.startLine+start,endLine:fragment.startLine+i-1,text:lines.slice(start,i).join('\n')});
   start=i+1;
  }
  return result;
 }
 for(const doc of [false,true])for(const candidate of fragments){
  if(candidate.documentation!==doc)continue;
  for(const fragment of remaining(candidate)){
  const intro=doc&&!documentationStarted?'\nSelected Python docstrings (verbatim; source ranges below):\n':'';
  const block=`${intro}\n--- ${JSON.stringify(fragment.path)} lines ${fragment.startLine}-${fragment.endLine} ---\n${fragment.text}\n`;
  if(Buffer.byteLength(source+block)>budget){omissions.push({path:fragment.path,startLine:fragment.startLine,endLine:fragment.endLine,kind:doc?'documentation':'source',reason:'output budget'});continue;}
  source+=block;if(doc)documentationStarted=true;
  delivered.push({path:fragment.path,startLine:fragment.startLine,endLine:fragment.endLine});
  let known=admitted.get(fragment.path);if(!known){known=new Set();admitted.set(fragment.path,known);}
  for(let line=fragment.startLine;line<=fragment.endLine;line++)known.add(line);
  }
 }
 // A later, narrower selection may recover lines from an earlier oversized fragment.
 const outstanding=omissions.flatMap(o=>remaining({path:o.path as string,startLine:o.startLine as number,endLine:o.endLine as number,text:Array((o.endLine as number)-(o.startLine as number)+1).fill('').join('\n'),documentation:o.kind==='documentation'}).map(r=>({...o,startLine:r.startLine,endLine:r.endLine})));
 return{source,delivered,omissions:outstanding};
}
