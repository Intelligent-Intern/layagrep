import {test} from 'node:test';
import assert from 'node:assert/strict';
import {completeSourceFragments} from './complete-source-v64-spike';

test('inspection covers interior source and exact UTF-8 intervals without gaps or duplicated bytes',()=>{
 const text='setup = 0\r\n'.repeat(2000)+'def unnamed_branch():\n    return "interior evidence"\n'+'🦉'.repeat(2000)+'\nlast = 1';
 const bytes=Buffer.from(text),spans=completeSourceFragments(bytes);
 assert.equal(spans.map(s=>s.text).join(''),text);
 let cursor=0;
 for(const span of spans){
  assert.equal(span.sourceByteStart,cursor);
  assert.equal(bytes.subarray(span.sourceByteStart,span.sourceByteEnd).toString('utf8'),span.text);
  assert.equal(span.startLine,bytes.subarray(0,span.sourceByteStart).toString('utf8').split('\n').length);
  assert.equal(span.endLine,span.startLine+(span.text.match(/\n/g)??[]).length-(span.text.endsWith('\n')?1:0));
  assert.ok(!span.text.includes('\uFFFD'));
  cursor=span.sourceByteEnd;
 }
 assert.equal(cursor,bytes.length);
 assert.ok(spans.some(s=>s.text.includes('interior evidence')));
});
