import {packPreviews as packGlobal, type JointCandidate} from './global-packet-v68-spike';

export function packPreviews(candidates:JointCandidate[],budget:number,threshold:number){
 if(!Number.isFinite(threshold)||threshold<0||threshold>1)throw new Error('Invalid relevance threshold');
 const negatives:Record<string,unknown>[]=[];
 const admitted=candidates.map(c=>{
  const complete=c.fragmentScores.length===c.fragments.length&&c.fragmentScores.every(s=>s!==null&&Number.isFinite(s)&&s>=0&&s<=1);
  // Preserve prior uncertainty handling; a partial ranking is not negative evidence.
  if(!complete)return c;
  const fragments:typeof c.fragments=[];const scores:number[]=[];
  c.fragments.forEach((span,i)=>{
   const score=c.fragmentScores[i]!;
   if(score>threshold){fragments.push(span);scores.push(score);}
   else{const{text,...range}=span;negatives.push({path:c.path,...range,fragmentScore:score,threshold,reason:'fragment at or below relevance threshold'});}
  });
  return{...c,fragments,fragmentScores:scores};
 });
 const packed=packGlobal(admitted,budget);
 return{...packed,omissions:[...packed.omissions,...negatives]};
}
