import {formatCoverage} from './coverage-spike';
export function formatFragmentOmissions(records:Record<string,unknown>[]){
 const other:Record<string,unknown>[]=[];
 const groups=new Map<string,{path:string;threshold:number;fragmentCount:number;lines:[number,number][]}>();
 for(const record of records){
  const {path,threshold,startLine,endLine}=record;
  if(record.reason!=='fragment at or below relevance threshold'||typeof path!=='string'||typeof threshold!=='number'||!Number.isFinite(threshold)||typeof startLine!=='number'||typeof endLine!=='number'||!Number.isInteger(startLine)||!Number.isInteger(endLine)||startLine<1||endLine<startLine){other.push(record);continue;}
  const key=JSON.stringify([path,threshold]);let group=groups.get(key);
  if(!group){group={path,threshold,fragmentCount:0,lines:[]};groups.set(key,group);}
  group.fragmentCount++;group.lines.push([startLine,endLine]);
 }
 const summaries=[...groups.values()].map(group=>{
  const lines:[number,number][]=[];
  for(const [start,end] of group.lines.sort((a,b)=>a[0]-b[0]||a[1]-b[1])){
   const previous=lines.at(-1);
   if(previous&&start<=previous[1]+1)previous[1]=Math.max(previous[1],end);
   else lines.push([start,end]);
  }
  return JSON.stringify({path:group.path,decision:'checked-negative fragments',threshold:group.threshold,fragmentCount:group.fragmentCount,lines});
 });
 return [formatCoverage(other),...(summaries.length?['Fragment summaries are not whole-file judgments; lines may be partial; exact byte ranges and scores remain in the saved full report.',...summaries]:[])].filter(Boolean).join('\n');
}
