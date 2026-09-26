import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rankLexical} from './lexical-rank-v44-spike';
test('exact identifiers find every matching source without admitting substring lookalikes',()=>{
 const documents=[{path:'a.py',text:'def exp(value): return value'},{path:'b.py',text:'def exp(other): return other'},{path:'c.py',text:'expected = expression'}];
 const result=rankLexical(documents,'exp');
 assert.deepEqual(result.decisions.filter(d=>d.selected).map(d=>d.path),['a.py','b.py']);
 assert.deepEqual(result.decisions[2]!.matchedTerms,[]);
});
test('identifiers with combining marks match whole names without matching a longer name',()=>{
 const result=rankLexical([{path:'named.py',text:'def नाम(): pass'},{path:'longer.py',text:'def नामावलि(): pass'}],'नाम');
 assert.deepEqual(result.decisions.filter(d=>d.selected).map(d=>d.path),['named.py']);
});
