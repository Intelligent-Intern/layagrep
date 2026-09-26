import {spawnSync} from 'node:child_process';
import expansion from './call-definitions-v55-spike.py' with {type:'text'};
import families from './definition-families-v57-spike.py' with {type:'text'};
import glue from './family-context-v58-spike.py' with {type:'text'};
import type {PreviewSpan} from './content-handoff-v47-spike';
export type FamilyDocument={path:string;text:string;seed_ranges:number[][];visible_ranges:number[][]};
export type FamilyMember=PreviewSpan&{path:string;symbol:string;truncated:boolean;runtime_dispatch_unknown:true};
export type FamilyGroup={id:string;member_ids:string[];request:{state:{definitions:FamilyMember[];callers:{call_identifiers:{path:string;sourceByteStart:number;sourceByteEnd:number}[]}[];[key:string]:unknown};questions:Record<string,{type:'boolean';instructions:string}>}};
export function prepareGroups(query:string,documents:FamilyDocument[],selected:(PreviewSpan&{path:string;fragmentScore?:number})[],threshold:number){
 const script=expansion+'\n'+families+'\nimport json,sys\n'+glue+'\njson.dump(prepare_groups(json.load(sys.stdin)),sys.stdout)\n';
 const result=spawnSync('python3',['-I','-c',script],{input:JSON.stringify({query,documents,selected,threshold}),encoding:'utf8',maxBuffer:16_000_000,timeout:30000});
 if(result.status!==0)return{groups:[] as FamilyGroup[],error:'Dependency planning failed or exceeded local bounds',skipped:[]};
 const parsed=JSON.parse(result.stdout);const known=new Map(documents.map(d=>[d.path,Buffer.from(d.text)]));
 for(const group of parsed.groups as FamilyGroup[])for(const d of group.request.state.definitions){
  const raw=known.get(d.path);if(!raw||raw.subarray(d.sourceByteStart,d.sourceByteEnd).toString('utf8')!==d.text)throw new Error('Dependency source mismatch');
 }
 return parsed as {groups:FamilyGroup[];skipped:unknown[];error?:string;[key:string]:unknown};
}
