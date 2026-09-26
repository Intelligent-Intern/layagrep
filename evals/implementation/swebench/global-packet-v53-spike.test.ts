import {test} from 'node:test';
import assert from 'node:assert/strict';
import {packPreviews} from './global-packet-v53-spike';
const span=(text:string,start:number,basis='query-named implementation')=>({text,startLine:start,endLine:start,sourceByteStart:start*50,sourceByteEnd:start*50+Buffer.byteLength(text),basis});
const header=span('def load():',1,'query-named declaration header'),body=span('return convert(key)',2),weak=span('import unrelated',3,'opening context');
test('high relevance source across files precedes weaker source, including equal-scored headers',()=>{
 const p=packPreviews([{path:'a.py',score:.9,spans:[header,body],fragments:[header,body],fragmentScores:[.9,.9]},{path:'b.py',score:.8,spans:[weak],fragments:[weak],fragmentScores:[.1]}],10000);
 assert.deepEqual(p.delivered.map(s=>s.text),[body.text,header.text,weak.text]);
});
test('unavailable ranking is interleaved without substituting a low score or filtering it',()=>{
 const p=packPreviews([{path:'known.py',score:.95,spans:[header,body],fragments:[header,body],fragmentScores:[.6,.9]},{path:'unknown.py',score:.85,spans:[body,header],fragments:[header,body],fragmentScores:[null,.99]}],10000);
 assert.deepEqual(p.delivered.map(s=>[s.path,s.text]),[['known.py',body.text],['unknown.py',header.text],['known.py',header.text],['unknown.py',body.text]]);
 assert.deepEqual(p.fallbackFiles,['unknown.py']);assert.ok(p.delivered.filter(s=>s.path==='unknown.py').every(s=>!('fragmentScore' in s)));
 const z=packPreviews([{path:'unknown.py',score:.85,spans:[body,header],fragments:[header,body],fragmentScores:[null,.99]}],0);
 assert.equal(z.source,'');assert.deepEqual(z.omissions.map(s=>s.sourceByteStart),[header.sourceByteStart,body.sourceByteStart]);
});
