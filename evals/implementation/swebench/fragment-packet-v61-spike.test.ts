import {test} from 'node:test';
import assert from 'node:assert/strict';
import {packPreviews} from './fragment-packet-v61-spike';
const span=(text:string,start:number)=>({text,startLine:start,endLine:start,sourceByteStart:start*100,sourceByteEnd:start*100+Buffer.byteLength(text),basis:'complete source'});
test('source admission follows fragment threshold, with explicit negative ranges and no top-N',()=>{
 const spans=['needed A','irrelevant B','boundary C','needed D','needed E'].map((s,i)=>span(s,i+1));
 const packet=packPreviews([{path:'module.py',score:.9,spans,fragments:spans,fragmentScores:[.9,.2,.5,.7,.6]}],10000,.5);
 assert.deepEqual(packet.delivered.map(s=>s.text),['needed A','needed D','needed E']);
 assert.ok(!packet.source.includes('irrelevant B')&&!packet.source.includes('boundary C'));
 assert.deepEqual(packet.omissions.map(s=>({path:s.path,start:s.sourceByteStart,reason:s.reason})),[
  {path:'module.py',start:200,reason:'fragment at or below relevance threshold'},
  {path:'module.py',start:300,reason:'fragment at or below relevance threshold'},
 ]);
});
test('unknown rankings retain source and budget omissions remain distinct from negative judgments',()=>{
 const a=span('uncertain source',1),b=span('another uncertain source',2),c=span('known negative',3);
 const candidates=[{path:'unknown.py',score:.8,spans:[a,b],fragments:[a,b],fragmentScores:[null,.1]},
  {path:'negative.py',score:.8,spans:[c],fragments:[c],fragmentScores:[.2]}];
 const visible=packPreviews(candidates,10000,.5);
 assert.deepEqual(visible.delivered.map(s=>s.text),[a.text,b.text]);
 assert.deepEqual(visible.fallbackFiles,['unknown.py']);
 assert.ok(visible.delivered.every(s=>!('fragmentScore' in s)));
 const empty=packPreviews(candidates,0,.5);
 assert.equal(empty.source,'');
 assert.deepEqual(empty.omissions.map(s=>[s.path,s.sourceByteStart,s.reason]),[
  ['unknown.py',100,'output budget'],['unknown.py',200,'output budget'],
  ['negative.py',300,'fragment at or below relevance threshold'],
 ]);
});
