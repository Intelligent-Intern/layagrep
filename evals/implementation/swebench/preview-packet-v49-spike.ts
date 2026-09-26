import type {PreviewSpan} from './content-handoff-v47-spike';
type Candidate={path:string;score:number;spans:PreviewSpan[]};
// Give query-named source and its enclosing context budget priority over broad
// previews. Round-robin within each tier preserves opportunities across files;
// this is presentation ordering, not a new relevance judgment.
export function packPreviews(candidates:Candidate[],budget:number){
 const priority=(s:PreviewSpan)=>s.basis==='query-named declaration header'?0:s.basis.startsWith('query-named implementation')?1:s.basis==='enclosing class context'?2:s.basis==='complete source'?3:s.basis==='opening context'?4:5;
 const files=[...candidates].sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path)).map(c=>({...c,spans:[...c.spans].sort((a,b)=>priority(a)-priority(b)||a.startLine-b.startLine)}));
 let source='';const delivered:(PreviewSpan&{path:string})[]=[];const omissions:Record<string,unknown>[]=[];
 for(const focused of [true,false]){
 const tier=files.map(f=>({...f,spans:f.spans.filter(s=>(priority(s)<3)===focused)}));
 for(let index=0;tier.some(f=>index<f.spans.length);index++)for(const file of tier){
  const span=file.spans[index];if(!span)continue;
  const columns=span.columnStartByte===undefined?'':`; bytes ${span.columnStartByte}-${span.columnEndByte} within line`;
  const block=`\n--- ${JSON.stringify(file.path)} lines ${span.startLine}-${span.endLine}; source bytes [${span.sourceByteStart},${span.sourceByteEnd})${columns}${span.partialLine?'; partial line text':''}; ${span.basis} ---\n${span.text}\n`;
  if(Buffer.byteLength(source+block)>budget){const {text:omittedText,...range}=span;omissions.push({path:file.path,...range,reason:'output budget'});continue;}
  source+=block;delivered.push({path:file.path,...span});
 }
 }
 return{source,delivered,omissions};
}
