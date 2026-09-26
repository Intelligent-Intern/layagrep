import {test} from 'node:test';
import assert from 'node:assert/strict';
import {previewFragments} from './preview-fragments-v51-spike';
test('split previews retain exact contiguous Unicode bytes within their original interval',()=>{
 const text='def collect():\n'+('    return "😀é"\n').repeat(100)+'tail';const start=29;
 const fragments=previewFragments([{text,startLine:3,endLine:104,basis:'query-named implementation',sourceByteStart:start,sourceByteEnd:start+Buffer.byteLength(text)}],53);
 assert.ok(fragments.length>1);assert.ok(fragments.every(f=>Buffer.byteLength(f.text)<=53));assert.equal(fragments.map(f=>f.text).join(''),text);
 let offset=start;for(const f of fragments){assert.equal(f.sourceByteStart,offset);offset=f.sourceByteEnd;assert.equal(Buffer.from(f.text).toString(),f.text);assert.equal(f.sourceByteEnd-f.sourceByteStart,Buffer.byteLength(f.text));}assert.equal(offset,start+Buffer.byteLength(text));
});
test('long partial lines never split a multibyte character or retain stale column bounds',()=>{
 const text='😀é'.repeat(20);const parts=previewFragments([{text,startLine:8,endLine:8,basis:'distributed context',partialLine:true,columnStartByte:12,columnEndByte:12+Buffer.byteLength(text),sourceByteStart:300,sourceByteEnd:300+Buffer.byteLength(text)}],5);
 assert.equal(parts.map(p=>p.text).join(''),text);assert.ok(parts.every(p=>Buffer.byteLength(p.text)<=5&&p.partialLine&&p.startLine===8&&p.endLine===8&&p.columnStartByte===undefined&&p.columnEndByte===undefined));
});
test('newline-boundary fragments label only lines actually delivered',()=>{
 const parts=previewFragments([{text:'abc\ndef\n',startLine:7,endLine:8,basis:'distributed context',sourceByteStart:20,sourceByteEnd:28}],4);
 assert.deepEqual(parts.map(p=>[p.startLine,p.endLine,p.text]),[[7,7,'abc\n'],[8,8,'def\n']]);
});
