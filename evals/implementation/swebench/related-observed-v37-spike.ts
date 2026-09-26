// Disposable Python-only evidence selector; operates only on source already encountered.
import {spawnSync} from 'node:child_process';
import parser from './related-observed-v37-spike.py' with {type:'text'};
export type ObservedDocument={path:string;text:string};
export type RelatedExcerpt={sourceEndLine?:number;declarationEndLine?:number;path:string;symbol:string;startLine:number;endLine:number;text:string;truncated:boolean;not_verified_runtime_dispatch:true};
export type RelatedGroup={relatedContext:RelatedExcerpt[];declarations:(RelatedExcerpt&{declarationEndLine:number})[];omitted_context_ranges:number;omitted_declarations:number};
export function relatedObserved(query:string,documents:ObservedDocument[]):{candidates:Record<string,RelatedGroup>;examined_edges:number;edge_guard_reached:boolean;skipped:unknown[];unresolved_attributes:unknown[];error?:string}{
 const result=spawnSync('python3',['-I','-c',parser],{input:JSON.stringify({query,documents:documents.filter(d=>d.path.endsWith('.py'))}),stdio:['pipe','pipe','pipe'],encoding:'utf8',maxBuffer:16_000_000,timeout:30_000});
 if(result.status!==0)return{candidates:{},examined_edges:0,edge_guard_reached:false,skipped:[],unresolved_attributes:[],error:'Observed-source relationship extraction failed or exceeded local bounds'};
 const parsed=JSON.parse(result.stdout),known=new Map(documents.map(d=>[d.path,d]));
 for(const group of Object.values(parsed.candidates) as RelatedGroup[]){
  group.declarations=group.declarations.map(e=>({...exactRelatedExcerpt(e,known.get(e.path)!,12000),declarationEndLine:e.declarationEndLine}));
  group.relatedContext=group.relatedContext.map(e=>exactRelatedExcerpt(e,known.get(e.path)!,1800));
 }
 return parsed;
}

// Preserve whole verbatim lines so relationship excerpts can share the ordinary
// source packet without conflicting with another excerpt of the same line.
export function exactRelatedExcerpt(excerpt:RelatedExcerpt,document:ObservedDocument,byteLimit:number):RelatedExcerpt{
 const all=document.text.split('\n'),parts:string[]=[];let bytes=0;
 for(let line=excerpt.startLine;line<=Math.min(excerpt.endLine,all.length);line++){
  const value=all[line-1]!,cost=Buffer.byteLength(value)+(parts.length?1:0);
  if(bytes+cost>byteLimit)break;
  parts.push(value);bytes+=cost;
 }
 return{...excerpt,sourceEndLine:excerpt.declarationEndLine??excerpt.endLine,text:parts.join('\n'),endLine:excerpt.startLine+parts.length-1,truncated:excerpt.truncated||parts.length<excerpt.endLine-excerpt.startLine+1};
}
