import {test} from 'node:test';
import assert from 'node:assert/strict';
import {relatedObserved,exactRelatedExcerpt} from './related-observed-v37-spike';
import {packCodeFirst} from './source-code-first-spike';
test('observed caller chain returns target code with no additional source crawl',()=>{
 const result=relatedObserved('start',[{path:'caller.py',text:'def start():\n    return Target().answer()\n'},{path:'target.py',text:'class Target:\n    def answer(self):\n        return 42\n'}]);
 assert.equal(result.error,undefined);assert.deepEqual(result.candidates['target.py']!.declarations.map(d=>d.symbol),['Target.answer','Target']);
 assert.ok(result.candidates['target.py']!.declarations[0]!.text.includes('return 42'));
 assert.equal(result.candidates['target.py']!.relatedContext[0]!.not_verified_runtime_dispatch,true);
});
test('partial final lines cannot corrupt overlapping verbatim source',()=>{
 const document={path:'a.py',text:'short\nlonger line\nlast'};
 const e=exactRelatedExcerpt({path:'a.py',symbol:'f',startLine:1,endLine:3,text:'short\nlo',truncated:true,not_verified_runtime_dispatch:true},document,8);
 assert.equal(e.text,'short');assert.equal(e.endLine,1);assert.equal(e.sourceEndLine,3);assert.equal(e.truncated,true);
 const packet=packCodeFirst([{...e,score:0.6},{path:'a.py',startLine:1,endLine:3,text:document.text,score:0.8}],1000,new Map());
 assert.ok(packet.source.includes('longer line'));assert.deepEqual(packet.omissions,[]);
});
