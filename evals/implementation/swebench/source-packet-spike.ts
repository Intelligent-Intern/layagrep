// Disposable handoff experiment: each returned source line occurs once per file.
type Span={startLine:number;endLine:number;text:string};
type Snippet={path:string;score:number;text:string;startLine?:number;endLine?:number;contexts?:Span[]};
export function packSource(snippets:Snippet[],budget:number){
 let source='';const delivered:{path:string;startLine?:number;endLine?:number}[]=[];
 const omissions:Record<string,unknown>[]=[];const emitted=new Map<string,Map<number,string>>();
 for(const snippet of [...snippets].sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path)||(a.startLine??0)-(b.startLine??0))){
  const pending=new Map(emitted.get(snippet.path));let block='';
  if(snippet.startLine===undefined){block=`\n--- ${JSON.stringify(snippet.path)} complete file ---\n${snippet.text}\n`;}
  else{
   const spans=[...(snippet.contexts??[]),{startLine:snippet.startLine,endLine:snippet.endLine!,text:snippet.text}];
   for(const span of spans){
    const lines=span.text.split('\n');
    if(lines.length!==span.endLine-span.startLine+1)throw new Error('Source range does not match text');
    let start:number|undefined;let group:string[]=[];
    const flush=()=>{if(start!==undefined){block+=`\n--- ${JSON.stringify(snippet.path)} lines ${start}-${start+group.length-1} ---\n${group.join('\n')}\n`;start=undefined;group=[];}};
    for(let offset=0;offset<lines.length;offset++){
     const line=span.startLine+offset,text=lines[offset]!;
     if(pending.has(line)){if(pending.get(line)!==text)throw new Error('Conflicting source line');flush();continue;}
     if(start===undefined)start=line;group.push(text);pending.set(line,text);
    }
    flush();
   }
   if(!block)block=`\n--- ${JSON.stringify(snippet.path)} lines ${snippet.startLine}-${snippet.endLine}: already included above ---\n`;
  }
  if(Buffer.byteLength(source+block)>budget){omissions.push({path:snippet.path,startLine:snippet.startLine,endLine:snippet.endLine,reason:'output budget'});continue;}
  source+=block;emitted.set(snippet.path,pending);delivered.push({path:snippet.path,startLine:snippet.startLine,endLine:snippet.endLine});
 }
 return{source,delivered,omissions};
}
