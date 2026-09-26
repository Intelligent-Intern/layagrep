import {test} from 'node:test';
import assert from 'node:assert/strict';
import {packPreviews} from './preview-packet-v49-spike';
test('query-named implementation survives broad previews when its header and body fit',()=>{
 const header={startLine:1,endLine:1,text:'class Reader:',basis:'query-named declaration header',sourceByteStart:0,sourceByteEnd:13};
 const body={startLine:2,endLine:3,text:'    def read(self):\n        return "complete result"',basis:'query-named implementation',sourceByteStart:14,sourceByteEnd:65};
 const broad={startLine:1,endLine:1,text:'x'.repeat(350),basis:'opening context',sourceByteStart:0,sourceByteEnd:350};
 const result=packPreviews([{path:'reader.py',score:.95,spans:[header,body]},{path:'tests.py',score:.8,spans:[broad]}],600);
 assert.ok(result.source.includes(body.text),'Broad opening context displaced the query-named body');
 assert.ok(result.source.includes(header.text));assert.ok(Buffer.byteLength(result.source)<=600);
 assert.ok(result.omissions.some(o=>o.path==='tests.py'&&o.sourceByteStart===0&&o.sourceByteEnd===350));
 assert.ok(!result.omissions.some(o=>o.path==='reader.py'));
});
