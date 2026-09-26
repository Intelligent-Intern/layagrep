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
 const known=files.flatMap(file=>file.spans.filter(span=>'fragmentScore' in span).map(span=>({file,span})));
 known.sort((a,b)=>Number((b.span as PreviewSpan&{fragmentScore:number}).fragmentScore)-Number((a.span as PreviewSpan&{fragmentScore:number}).fragmentScore)||Number(a.span.basis==='query-named declaration header')-Number(b.span.basis==='query-named declaration header')||b.file.score-a.file.score||a.file.path.localeCompare(b.file.path)||a.span.sourceByteStart-b.span.sourceByteStart);
 const fallback:typeof known=[];
 const unknownFiles=files.filter(f=>fallbackFiles.includes(f.path));
 for(let index=0;unknownFiles.some(f=>index<f.spans.length);index++)for(const file of unknownFiles){const span=file.spans[index];if(span)fallback.push({file,span});}
 const ordered:typeof known=[];
 for(let i=0;i<Math.max(known.length,fallback.length);i++){if(known[i])ordered.push(known[i]!);if(fallback[i])ordered.push(fallback[i]!);}
 const blocks:string[]=[];let sourceBytes=0;const delivered:(PreviewSpan&{path:string})[]=[];const omissions:Record<string,unknown>[]=[];
 for(const {file,span} of ordered){
  const score='fragmentScore' in span?`; fragment relevance ${span.fragmentScore}`:'; fragment ranking unavailable; prior preview priority order';
  const block=`\n--- ${JSON.stringify(file.path)} lines ${span.startLine}-${span.endLine}; source bytes [${span.sourceByteStart},${span.sourceByteEnd})${span.partialLine?'; partial line text':''}; ${span.basis}${score} ---\n${span.text}\n`;
  const blockBytes=Buffer.byteLength(block);
  if(sourceBytes+blockBytes>budget){const{text,...range}=span;omissions.push({path:file.path,...range,reason:'output budget'});continue;}
  blocks.push(block);sourceBytes+=blockBytes;delivered.push({path:file.path,...span});
 }
 return{source:blocks.join(''),delivered,omissions,fallbackFiles};
}
