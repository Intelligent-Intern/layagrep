import {createGateway,experimental_evaluate as evaluate} from '../../../packages/core/node_modules/ai';
import {readFileSync,writeFileSync} from 'node:fs';
const out='evals/runs/swebench/auto-research-80/declaration-id-diagnostic';
const cases=JSON.parse(readFileSync(out+'/requests.json','utf8'));
const gateway=createGateway({apiKey:process.env.AI_GATEWAY_API_KEY});
const results:any[]=[];let next=0;
await Promise.all(Array.from({length:2},async()=>{
 while(next<cases.length){
  const c=cases[next++]!;let result:any;
  try{const r=await evaluate({model:gateway.evaluationModel('typesafe-ai/jev'),...c.request,maxRetries:0,abortSignal:AbortSignal.timeout(15000)});result={answers:r.answers,usage:r.usage};}
  catch(e){result={error:(e as Error).name};}
  results.push({...c,request:undefined,...result});writeFileSync(out+'/results.json',JSON.stringify(results,null,2));
 }
}));
console.log(JSON.stringify({planned:cases.length,completed:results.length,errors:results.filter(r=>r.error).length}));
