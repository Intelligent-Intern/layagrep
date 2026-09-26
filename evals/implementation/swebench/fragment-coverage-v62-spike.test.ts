import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatFragmentOmissions} from './fragment-coverage-v62-spike';
import {formatCoverage} from './coverage-spike';
test('checked-negative fragments become per-file line summaries without labeling the whole file negative',()=>{
 const records=[{path:'a.py',startLine:1,endLine:3,sourceByteStart:0,sourceByteEnd:25,fragmentScore:.1,threshold:.5,reason:'fragment at or below relevance threshold'},
  {path:'a.py',startLine:3,endLine:5,sourceByteStart:20,sourceByteEnd:45,fragmentScore:.2,threshold:.5,reason:'fragment at or below relevance threshold'},
  {path:'b.py',startLine:10,endLine:11,sourceByteStart:90,sourceByteEnd:110,fragmentScore:.5,threshold:.5,reason:'fragment at or below relevance threshold'}];
 const text=formatFragmentOmissions(records);
 const rows=text.split('\n').filter(l=>l.startsWith('{')).map(l=>JSON.parse(l));
 assert.deepEqual(rows,[{path:'a.py',decision:'checked-negative fragments',threshold:.5,fragmentCount:2,lines:[[1,5]]},{path:'b.py',decision:'checked-negative fragments',threshold:.5,fragmentCount:1,lines:[[10,11]]}]);
 assert.ok(text.includes('not whole-file judgments'));
 assert.ok(text.includes('exact byte ranges and scores remain in the saved full report'));
});
test('budget, unknown and unrepresentable ranges keep their complete records',()=>{
 const records=[{path:'a.py',startLine:1,endLine:3,reason:'output budget',sourceByteStart:0,sourceByteEnd:25},
  {path:'b.py',reason:'read or source screening failed',error:'unavailable'},
  {path:'c.py',threshold:.5,reason:'fragment at or below relevance threshold',sourceByteStart:2,sourceByteEnd:4}];
 assert.equal(formatFragmentOmissions(records),formatCoverage(records));
});
