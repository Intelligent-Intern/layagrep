import {test} from 'node:test';
import assert from 'node:assert/strict';
import {packReport} from './complete-report-v68-spike';
test('saved report preserves every positive interval beyond display allowance and separates unknown from negative',()=>{
 const fragments=['first evidence','later evidence','unknown evidence','negative evidence'].map((text,i)=>({text,startLine:i+1,endLine:i+1,sourceByteStart:i*100,sourceByteEnd:i*100+Buffer.byteLength(text),basis:'complete-file inspection'}));
 const r=packReport([{path:'module.py',score:.9,spans:fragments,fragments,fragmentScores:[.9,.8,null,.2]}],0,.5);
 assert.equal(r.display.source,'');
 assert.deepEqual(r.report.delivered.map(s=>s.text),['first evidence','later evidence']);
 assert.ok(r.report.source.includes('later evidence'));
 assert.deepEqual(r.unknown.map(s=>[s.path,s.sourceByteStart]),[['module.py',200]]);
 assert.deepEqual(r.report.omissions.map(s=>[s.sourceByteStart,s.reason]),[[300,'fragment at or below relevance threshold']]);
 assert.deepEqual(r.display.omissions.filter(s=>s.reason==='output budget').map(s=>s.sourceByteStart),[0,100]);
});
