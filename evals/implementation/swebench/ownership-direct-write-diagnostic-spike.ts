import {createGateway,experimental_evaluate as evaluate} from '../../../packages/core/node_modules/ai';
import {readFileSync,writeFileSync} from 'node:fs';
const out='evals/runs/swebench/auto-research-80/ownership-direct-write-diagnostic';
const originals=JSON.parse(readFileSync('evals/runs/swebench/auto-research-80/ownership-isolated-source-diagnostic/requests.json','utf8')).filter((c:any)=>c.arm==='mixed');
const cases:any[]=[];
for(const c of originals)for(const arm of ['old','direct-write']){
 const request=structuredClone(c.request);
 if(arm==='direct-write')for(const [i,d] of c.group.entries())request.questions[`m${i}`]={type:'boolean',instructions:`Does the body of declaration ${d.name}, lines ${d.startLine}-${d.endLine}, assign one of its own incoming parameters (or an alias of it) to an object attribute or other persistent state, without making an independent copy of the mutable value? Inspect declarations[${i}].source (id u${i}). Require a visible write in this declaration. Merely reading or returning existing state, computing a result from it, or calling another declaration is not a write here. Do not attribute assignments in other declarations to this one. The stored input must be a value container such as an array, sequence, mapping, or coordinate pair playing the kind of data role implicated by the query; retaining a collaborating service/resource object or independent scalar values does not count.`};
 cases.push({...c,arm,request});
}
writeFileSync(out+'/requests.json',JSON.stringify(cases,null,2));
const gateway=createGateway({apiKey:process.env.AI_GATEWAY_API_KEY}),results:any[]=[];let next=0;
await Promise.all(Array.from({length:2},async()=>{while(next<cases.length){const c=cases[next++]!;let result:any;try{const r=await evaluate({model:gateway.evaluationModel('typesafe-ai/jev'),...c.request,maxRetries:0,abortSignal:AbortSignal.timeout(15000)});result={answers:r.answers,usage:r.usage};}catch(e){result={error:String(e)};}results.push({...c,request:undefined,...result});writeFileSync(out+'/results.json',JSON.stringify(results,null,2));}}));
console.log(JSON.stringify({planned:cases.length,completed:results.length,errors:results.filter(r=>r.error).length}));
