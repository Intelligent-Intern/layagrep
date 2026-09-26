import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectSource,contextWindows} from './source-method-windows-spike';

test('TypeScript windows preserve a long leading explanation and trailing comment',()=>{
 const source='/**\n * rationale\n * second\n * third\n * fourth\n */\nexport const work = () => 1;\n// caller must await cleanup';
 const parsed=inspectSource('module.ts',source);
 assert.ok(parsed.units.some(x=>x.name==='work'));
 assert.deepEqual(contextWindows(source,parsed.units,parsed.comments),[{startLine:1,endLine:8}]);
});
test('JS, JSX and TSX preserve declaration boundaries',()=>{
 for(const path of ['module.js','module.jsx','module.tsx']){
  const source=path.endsWith('.js')?'export function view() { return 1; }':'export function view() { return <div>Hello</div>; }';
  assert.deepEqual(inspectSource(path,source).units,[{name:'view',startLine:1,endLine:1}]);
 }
});
test('unsupported and broken syntax can still return text context',()=>{
 for(const path of ['module.rs','broken.ts']){
  const source='first\nsecond\nthird\nconst = {\nfifth';
  assert.deepEqual(inspectSource(path,source).units,[]);
  assert.deepEqual(contextWindows(source,[{startLine:4,endLine:4}],[]),[{startLine:1,endLine:5}]);
 }
});
test('Python window includes comment paragraph before decorated declaration',()=>{
 const source='# one\n# two\n# three\n# four\n# five\n@decorate\ndef work():\n    """Explanation."""\n    pass\n# after';
 const parsed=inspectSource('module.py',source);
 assert.ok(parsed.units.some(x=>x.name==='work'));
 assert.deepEqual(contextWindows(source,parsed.units,parsed.comments),[{startLine:1,endLine:10}]);
});
test('missing Python leaves source available for fallback windows',()=>{
 const previous=process.env.PATH;
 try{
  process.env.PATH='';
  const source='# explanation\ndef work():\n    pass';
  const parsed=inspectSource('module.py',source);
  assert.deepEqual(parsed.units,[]);
  assert.deepEqual(contextWindows(source,[{startLine:2,endLine:3}],parsed.comments),[{startLine:1,endLine:3}]);
 }finally{if(previous===undefined)delete process.env.PATH;else process.env.PATH=previous;}
});

test('small classes expose complete named methods',()=>{
 for(const [path,source] of [['x.py','class Example:\n    def run(self):\n        return 1'],['x.ts','class Example {\n run() { return 1; }\n}']]){
  const units=inspectSource(path!,source!).units;
  assert.ok(units.some(unit=>unit.name==='Example.run'));
 }
});
