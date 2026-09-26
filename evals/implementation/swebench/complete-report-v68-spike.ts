import {packPreviews} from './fragment-packet-v68-spike';
import type {JointCandidate} from './global-packet-v53-spike';
export function packReport(candidates:JointCandidate[],displayBudget:number,threshold:number){
 if(!Number.isSafeInteger(displayBudget)||displayBudget<0)throw new Error('Invalid display allowance');
 const unknown:Record<string,unknown>[]=[];
 const known=candidates.map(candidate=>{
  const fragments:JointCandidate['fragments']=[],scores:number[]=[];
  candidate.fragments.forEach((span,i)=>{
   const score=candidate.fragmentScores[i];
   if(typeof score==='number'&&Number.isFinite(score)&&score>=0&&score<=1){fragments.push(span);scores.push(score);}
   else{const{text,...range}=span;unknown.push({path:candidate.path,...range,reason:'source judgment unavailable'});}
  });
  return{...candidate,spans:fragments,fragments,fragmentScores:scores};
 });
 // The complete report retains accepted source regardless of the stdout allowance.
 // Unjudged ranges remain explicit discovery signals, not automatically admitted code.
 return{display:packPreviews(known,displayBudget,threshold),report:packPreviews(known,Number.MAX_SAFE_INTEGER,threshold),unknown};
}
