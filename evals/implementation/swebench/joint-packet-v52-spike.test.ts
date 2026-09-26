import {test} from 'node:test';
import assert from 'node:assert/strict';
import {packPreviews} from './joint-packet-v52-spike';
const header={text:'class Handler:',startLine:1,endLine:1,sourceByteStart:0,sourceByteEnd:14,basis:'query-named declaration header'};
const body={text:'    return convert(key)',startLine:40,endLine:40,sourceByteStart:900,sourceByteEnd:923,basis:'query-named implementation'};
test('useful behavior precedes setup while another admitted file remains visible',()=>{
 const packet=packPreviews([{path:'a.py',score:.9,spans:[header,body],fragments:[header,body],fragmentScores:[.1,.95]},{path:'b.py',score:.8,spans:[header],fragments:[header],fragmentScores:[.7]}],10000);
 assert.equal(packet.delivered[0]!.text,body.text);assert.equal(packet.delivered[1]!.path,'b.py');assert.deepEqual(packet.fallbackFiles,[]);
});
test('missing fragment judgment retains prior packer priority order and explicit uncertainty',()=>{
 const packet=packPreviews([{path:'a.py',score:.9,spans:[body,header],fragments:[header,body],fragmentScores:[null,.95]},{path:'b.py',score:.2,spans:[body],fragments:[body],fragmentScores:[.1]}],10000);
 assert.deepEqual(packet.delivered.map(s=>[s.path,s.text]),[['a.py',header.text],['b.py',body.text],['a.py',body.text]]);assert.deepEqual(packet.fallbackFiles,['a.py']);assert.match(packet.source,/ranking unavailable/);
 const zero=packPreviews([{path:'a.py',score:.9,spans:[body,header],fragments:[header,body],fragmentScores:[null,.95]}],0);
 assert.equal(zero.source,'');assert.equal(zero.omissions[1]!.sourceByteStart,900);
});
