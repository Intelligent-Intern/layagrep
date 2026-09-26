import {createGateway,experimental_evaluate as evaluate} from '../../../packages/core/node_modules/ai';
import {readFileSync,writeFileSync} from 'node:fs';
const out='evals/runs/swebench/auto-research-80/ownership-fact-only-diagnostic';
const originals=JSON.parse(readFileSync('evals/runs/swebench/auto-research-80/ownership-direct-write-diagnostic/requests.json','utf8')).filter((c:any)=>c.arm==='direct-write');
const cases:any[]=[];
for(const c of originals)for(const arm of ['query-role','fact-only']){
 const request=structuredClone(c.request);
 if(arm==='fact-only')for(const [key,q] of Object.entries(request.questions) as any)if(key.startsWith('m'))q.instructions=q.instructions.replace(' playing the kind of data role implicated by the query','');
 cases.push({...c,arm,request});
}
writeFileSync(out+'/requests.json',JSON.stringify(cases,null,2));
const gateway=createGateway({apiKey:process.env.AI_GATEWAY_API_KEY}),results:any[]=[];let next=0;
await Promise.all(Array.from({length:2},async()=>{while(next<cases.length){const c=cases[next++]!;let result:any;try{const r=await evaluate({model:gateway.evaluationModel('typesafe-ai/jev'),...c.request,maxRetries:0,abortSignal:AbortSignal.timeout(15000)});result={answers:r.answers,usage:r.usage};}catch(e){result={error:String(e)};}results.push({...c,request:undefined,...result});writeFileSync(out+'/results.json',JSON.stringify(results,null,2));}}));
console.log(JSON.stringify({planned:cases.length,completed:results.length,errors:results.filter(r=>r.error).length}));
