import type {PreviewSpan} from './content-handoff-v47-spike';
export type JointCandidate={path:string;score:number;spans:PreviewSpan[];fragments:PreviewSpan[];fragmentScores:(number|null)[]};
export type DependencyGroup={id:string;score:number;callers:{path:string;sourceByteStart:number;sourceByteEnd:number}[];members:(PreviewSpan&{path:string;symbol:string})[]};
export function packPreviews(candidates:JointCandidate[],budget:number,dependencies:DependencyGroup[]=[]){
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
 let source='';const delivered:(PreviewSpan&{path:string})[]=[];const omissions:Record<string,unknown>[]=[];
 const visitedGroups=new Set<string>(),seen=new Set<string>();
 const identity=(path:string,span:PreviewSpan)=>JSON.stringify([path,span.sourceByteStart,span.sourceByteEnd]);
 function blockFor(path:string,span:PreviewSpan,dependency?:DependencyGroup){
  const score=dependency?`; possible dependency group ${dependency.id}; group relevance ${dependency.score}; runtime dispatch unverified`:'fragmentScore' in span?`; fragment relevance ${span.fragmentScore}`:'; fragment ranking unavailable; prior preview priority order';
  return `\n--- ${JSON.stringify(path)} lines ${span.startLine}-${span.endLine}; source bytes [${span.sourceByteStart},${span.sourceByteEnd})${span.partialLine?'; partial line text':''}; ${span.basis}${score} ---\n${span.text}\n`;
 }
 function emit(path:string,span:PreviewSpan,dependency?:DependencyGroup){
  const key=identity(path,span);if(dependency&&seen.has(key))return true;
  const block=blockFor(path,span,dependency);
  const extra=dependency?{dependencyGroup:dependency.id,dependencyScore:dependency.score,runtimeDispatchUnknown:true}:{};
  if(Buffer.byteLength(source+block)>budget){const{text,...range}=span;omissions.push({path,...range,...extra,reason:'output budget'});return false;}
  source+=block;seen.add(key);delivered.push({path,...span,...extra});return true;
 }
 for(const {file,span} of ordered){
  if(!emit(file.path,span))continue;
  for(const group of [...dependencies].sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id))){
   if(visitedGroups.has(group.id)||!group.callers.some(c=>c.path===file.path&&span.sourceByteStart<=c.sourceByteStart&&c.sourceByteEnd<=span.sourceByteEnd))continue;
   visitedGroups.add(group.id);
   const unique=new Set<string>();const unseen=group.members.filter(member=>{const key=identity(member.path,member);if(seen.has(key)||unique.has(key))return false;unique.add(key);return true;});
   const needed=unseen.reduce((sum,member)=>sum+Buffer.byteLength(blockFor(member.path,member,group)),0);
   if(Buffer.byteLength(source)+needed>budget){for(const member of unseen){const{text,...range}=member;omissions.push({...range,dependencyGroup:group.id,dependencyScore:group.score,runtimeDispatchUnknown:true,reason:'accepted family omitted for output budget'});}continue;}
   for(const member of unseen)emit(member.path,member,group);
  }
 }
 for(const group of dependencies)if(!visitedGroups.has(group.id))for(const member of group.members){
  if(seen.has(identity(member.path,member)))continue;
  const{text,...range}=member;omissions.push({...range,dependencyGroup:group.id,dependencyScore:group.score,runtimeDispatchUnknown:true,reason:'calling source not delivered'});
 }
 return{source,delivered,omissions,fallbackFiles};
}
