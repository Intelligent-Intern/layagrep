type Span={path:string;startLine?:number;endLine?:number};
type Candidate={path:string;score:number};
type Decision={path:string;kind:string;decision:string;score?:number;reason?:string};
function ranges(spans:Span[]){
 if(spans.some(s=>s.startLine===undefined||s.endLine===undefined))return 'complete file';
 const merged:[number,number][]=[];
 for(const span of [...spans].sort((a,b)=>a.startLine!-b.startLine!)){
  const previous=merged.at(-1);
  if(previous&&span.startLine!<=previous[1]+1)previous[1]=Math.max(previous[1],span.endLine!);
  else merged.push([span.startLine!,span.endLine!]);
 }
 return 'lines '+merged.map(([a,b])=>a===b?String(a):`${a}-${b}`).join(', ');
}
function status(decision:Decision|undefined){
 if(!decision)return 'no whole-file judgment; source may be caller/reference evidence';
 const score=decision.score===undefined?'':` (score ${decision.score})`;
 if(decision.decision==='relevant')return `file check accepted${score}`;
 if(decision.decision==='below-threshold')return `file check below threshold${score}; included source does not establish whole-file relevance`;
 return `file check unavailable/unknown: ${decision.reason??decision.decision}`;
}
// A manifest of delivered source, not a second relevance filter. Every returned
// path is represented, including callers whose broad file check failed.
export function handoffManifest(delivered:Span[],candidates:Candidate[],decisions:Decision[],omissions:(Span&{reason?:string})[]=[]):string[]{
 const byPath=new Map<string,Span[]>();
 for(const span of delivered){const group=byPath.get(span.path)??[];group.push(span);byPath.set(span.path,group);}
 const latest=new Map<string,Decision>();
 for(const d of decisions)if(d.kind==='file'||d.kind==='related-file')latest.set(d.path,d);
 const lines=[`Source available: ${byPath.size} paths. Ranges describe delivered code, not proof that the entire file is relevant.`];
 for(const [path,spans] of byPath)lines.push(`- ${JSON.stringify(path)} — ${ranges(spans)}; ${status(latest.get(path))}.`);
 const unavailable=decisions.filter(d=>['preview-unavailable','enumeration-failed','unscored-after-interruption','partially-enumerated-budget'].includes(d.decision));
 const seen=new Set<string>();
 lines.push('Failed or incomplete checks (unknown, not negative judgments):');
 for(const d of unavailable){
  // Superseded file failures remain in the detailed history, not the current manifest.
  if((d.kind==='file'||d.kind==='related-file')&&latest.get(d.path)!==d)continue;
  const key=JSON.stringify([d.path,d.kind,d.reason??d.decision]);if(seen.has(key))continue;seen.add(key);
  lines.push(`- ${JSON.stringify(d.path)} — ${d.kind}: ${d.reason??d.decision}${byPath.has(d.path)?'; source ranges available above':'; no source returned'}.`);
 }
 for(const omission of omissions){
  if(!['source screening incomplete','read or source screening failed'].includes(omission.reason??''))continue;
  const key=JSON.stringify(omission);if(seen.has(key))continue;seen.add(key);
  lines.push(`- ${JSON.stringify(omission.path)} — ${omission.reason}${omission.startLine!==undefined&&omission.endLine!==undefined?`; lines ${omission.startLine}-${omission.endLine}`:''}; unknown, not a negative judgment.`);
 }
 if(!seen.size)lines.push('- None.');
 const missing=candidates.filter(c=>!byPath.has(c.path));
 lines.push(`Selected candidates without source: ${missing.length}.`);
 for(const c of missing)lines.push(`- ${JSON.stringify(c.path)} — score ${c.score}; no source returned; inspect omissions.`);
 return lines;
}
