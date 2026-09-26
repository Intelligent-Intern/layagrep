import {test} from 'node:test';
import {deepStrictEqual} from 'node:assert';
import {mkdtempSync,writeFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {referenceContext} from './reference-context-spike';
test('follows a used import alias with caller evidence, without expanding its dependencies',()=>{
 const root=mkdtempSync(join(tmpdir(),'jev-reference-'));
 try{
  writeFileSync(join(root,'caller.py'),'from adapter import Box as Storage\ndef copy(value):\n    return Storage(value)\n');
  writeFileSync(join(root,'adapter.py'),'from deep import Impl\nclass Box:\n    def __init__(self, value):\n        self.value = Impl(value)\n');
  writeFileSync(join(root,'deep.py'),'class Impl: pass\n');
  const result=referenceContext(root,[{path:'caller.py',startLine:2,endLine:3}],100000);
  deepStrictEqual(result.candidates.map(x=>[x.path,x.symbol,x.callers[0]?.text]),[['adapter.py','Box','def copy(value):\n    return Storage(value)']]);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('a parameter shadowing an imported name does not introduce that dependency',()=>{
 const root=mkdtempSync(join(tmpdir(),'jev-shadow-'));
 try{
  writeFileSync(join(root,'caller.py'),'from adapter import Box\ndef copy(Box):\n    return Box()\n');
  writeFileSync(join(root,'adapter.py'),'class Box: pass\n');
  deepStrictEqual(referenceContext(root,[{path:'caller.py',startLine:2,endLine:3}],100000).candidates,[]);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('includes referenced same-file state while leaving unused state out',()=>{
 const root=mkdtempSync(join(tmpdir(),'jev-state-'));
 try{
  writeFileSync(join(root,'caller.py'),'pattern = "field:"\nunused = "other"\ndef parse(text):\n    return text.startswith(pattern)\n');
  const result=referenceContext(root,[{path:'caller.py',startLine:3,endLine:4}],100000);
  deepStrictEqual(result.candidates.map(x=>[x.symbol,x.text]),[['pattern','pattern = "field:"']]);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('does not read a referenced source through an out-of-root symlink',()=>{
 const root=mkdtempSync(join(tmpdir(),'jev-boundary-'));const outside=mkdtempSync(join(tmpdir(),'jev-outside-'));
 try{
  writeFileSync(join(root,'caller.py'),'from adapter import Box\ndef copy():\n    return Box()\n');
  writeFileSync(join(outside,'adapter.py'),'class Box: pass\n');
  symlinkSync(join(outside,'adapter.py'),join(root,'adapter.py'));
  const result=referenceContext(root,[{path:'caller.py',startLine:2,endLine:3}],100000);
  deepStrictEqual(result.candidates,[]);
  deepStrictEqual(result.unknown.some(x=>x.path==='adapter.py'),true);
 }finally{rmSync(root,{recursive:true,force:true});rmSync(outside,{recursive:true,force:true});}
});
test('reports a missing local import as unknown rather than a negative relevance judgment',()=>{
 const root=mkdtempSync(join(tmpdir(),'jev-missing-'));
 try{
  writeFileSync(join(root,'caller.py'),'from missing import Box\ndef copy():\n    return Box()\n');
  const result=referenceContext(root,[{path:'caller.py',startLine:2,endLine:3}],100000);
  deepStrictEqual(result.candidates,[]);
  deepStrictEqual(result.unknown,[{path:'caller.py',symbol:'Box',reason:'local import source unavailable'}]);
 }finally{rmSync(root,{recursive:true,force:true});}
});
