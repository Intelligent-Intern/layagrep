import type {PreviewSpan} from './content-handoff-v47-spike';
export type JointCandidate={path:string;score:number;spans:PreviewSpan[];fragments:PreviewSpan[];fragmentScores:(number|null)[]};
export function packPreviews(candidates:JointCandidate[],budget:number){
 const priority=(s:PreviewSpan)=>s.basis==='query-named declaration header'?0:s.basis.startsWith('query-named implementation')?1:s.basis==='enclosing class context'?2:s.basis==='complete source'?3:s.basis==='opening context'?4:5;
 const fallbackFiles:string[]=[];
 const files=[...candidates].sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path)).map(c=>{
  const complete=c.fragmentScores.length===c.fragments.length&&c.fragmentScores.every(s=>s!==null&&Number.isFinite(s)&&s>=0&&s<=1);
  if(!complete)fallbackFiles.push(c.path);
  const spans=complete?c.fragments.map((s,i)=>({...s,fragmentScore:c.fragmentScores[i]!})).sort((a,b)=>b.fragmentScore-a.fragmentScore||a.sourceByteStart-b.sourceByteStart):[...c.spans].sort((a,b)=>priority(a)-priority(b)||a.startLine-b.startLine);
  return{...c,spans};
 });
 let source='';const delivered:(PreviewSpan&{path:string})[]=[];const omissions:Record<string,unknown>[]=[];
 for(let index=0;files.some(f=>index<f.spans.length);index++)for(const file of files){
  const span=file.spans[index];if(!span)continue;
  const score='fragmentScore' in span?`; fragment relevance ${span.fragmentScore}`:'; fragment ranking unavailable; prior preview priority order';
  const block=`\n--- ${JSON.stringify(file.path)} lines ${span.startLine}-${span.endLine}; source bytes [${span.sourceByteStart},${span.sourceByteEnd})${span.partialLine?'; partial line text':''}; ${span.basis}${score} ---\n${span.text}\n`;
  if(Buffer.byteLength(source+block)>budget){const{text,...range}=span;omissions.push({path:file.path,...range,reason:'output budget'});continue;}
  source+=block;delivered.push({path:file.path,...span});
 }
 return{source,delivered,omissions,fallbackFiles};
}
