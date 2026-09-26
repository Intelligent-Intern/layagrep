import {test} from 'node:test';
import assert from 'node:assert/strict';
import {packPreviews} from './family-packet-v59-spike';
const make=(text:string,path:string,start:number,score:number)=>({path,score,spans:[{text,startLine:1,endLine:1,sourceByteStart:start,sourceByteEnd:start+Buffer.byteLength(text),basis:'query-named implementation'}],fragments:[{text,startLine:1,endLine:1,sourceByteStart:start,sourceByteEnd:start+Buffer.byteLength(text),basis:'query-named implementation'}],fragmentScores:[score]});
test('accepted dependency source follows the visible call before weaker unrelated context',()=>{
 const a=make('return v.convert()','caller.py',0,.9),b=make('unrelated = 1','other.py',0,.8);
 const group={id:'g',score:.7,callers:[{path:'caller.py',sourceByteStart:9,sourceByteEnd:16}],members:[{path:'defs.py',text:'return self',startLine:8,endLine:8,sourceByteStart:100,sourceByteEnd:111,basis:'possible dependency implementation',symbol:'Child.convert'}]};
 const p=packPreviews([a,b],10000,[group]);assert.deepEqual(p.delivered.map(s=>s.path),['caller.py','defs.py','other.py']);assert.match(p.source,/runtime dispatch unverified/);assert.match(p.source,/symbol "Child.convert"/);
});

test('undelivered caller leaves accepted dependency explicitly omitted',()=>{
 const a=make('return v.convert()','caller.py',0,.9);
 const group={id:'g',score:.7,callers:[{path:'caller.py',sourceByteStart:9,sourceByteEnd:16}],members:[{path:'defs.py',text:'return self',startLine:8,endLine:8,sourceByteStart:100,sourceByteEnd:111,basis:'possible dependency implementation',symbol:'Child.convert'}]};
 const p=packPreviews([a],0,[group]);assert.equal(p.source,'');assert.equal(p.delivered.length,0);assert.ok(p.omissions.some(s=>s.path==='defs.py'&&s.sourceByteStart===100&&s.sourceByteEnd===111&&s.reason==='calling source not delivered'));
});
test('output budget cannot split newly added family members',()=>{
 const a=make('return v.convert()','caller.py',0,.9);
 const group={id:'g',score:.7,callers:[{path:'caller.py',sourceByteStart:9,sourceByteEnd:16}],members:[
 {path:'defs.py',text:'x'.repeat(400),startLine:8,endLine:8,sourceByteStart:100,sourceByteEnd:500,basis:'possible dependency implementation',symbol:'Base.convert'},
 {path:'defs.py',text:'y'.repeat(400),startLine:9,endLine:9,sourceByteStart:501,sourceByteEnd:901,basis:'possible dependency implementation',symbol:'Child.convert'}]};
 const p=packPreviews([a],1000,[group]);assert.ok(p.delivered.some(s=>s.path==='caller.py'));assert.equal(p.delivered.filter(s=>s.path==='defs.py').length,0);assert.deepEqual(p.omissions.filter(s=>s.path==='defs.py').map(s=>s.sourceByteStart),[100,501]);
});
test('definition emitted before its caller still receives its qualified name',()=>{
 const target=make('return self','defs.py',100,.99),caller=make('return v.convert()','caller.py',0,.9);
 const group={id:'g',score:.7,callers:[{path:'caller.py',sourceByteStart:9,sourceByteEnd:16}],members:[{...target.spans[0]!,path:'defs.py',symbol:'Child.convert'}]};
 const p=packPreviews([target,caller],10000,[group]);assert.equal(p.delivered[0]!.path,'defs.py');assert.match(p.source.split('\n--- "caller.py"')[0]!,/symbol "Child.convert"/);assert.equal(p.delivered.filter(s=>s.path==='defs.py').length,1);
});
