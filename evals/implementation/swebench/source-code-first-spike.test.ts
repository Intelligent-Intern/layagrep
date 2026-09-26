import {test} from 'node:test';
import {deepStrictEqual,ok} from 'node:assert';
import {packCodeFirst} from './source-code-first-spike';
import {documentationRanges} from './source-documentation-spike';
test('puts executable source before documentation while retaining both verbatim',()=>{
 const text=['class Store:','    """Keep caller-owned data unchanged."""','    def copy(self):','        """Return an independent copy."""','        # Preserve caller state.','        return self.data.copy()'].join('\n');
 const docs=documentationRanges('store.py',text);
 const packed=packCodeFirst([{path:'store.py',score:.9,startLine:1,endLine:6,text}],10000,new Map([['store.py',docs.ranges]]));
 ok(packed.source.indexOf('return self.data.copy()')<packed.source.indexOf('Keep caller-owned data unchanged.'));
 ok(packed.source.includes('# Preserve caller state.'));
 const lines=new Map<number,string>();const pattern=/--- "store.py" lines (\d+)-(\d+) ---\n/g;
 for(const m of packed.source.matchAll(pattern)){
  const start=Number(m[1]),end=Number(m[2]);const block=packed.source.slice(m.index!+m[0].length).split('\n').slice(0,end-start+1);
  block.forEach((line,i)=>{ok(!lines.has(start+i));lines.set(start+i,line);});
 }
 deepStrictEqual([...lines].sort((a,b)=>a[0]-b[0]),text.split('\n').map((line,i)=>[i+1,line]));
 deepStrictEqual(packed.omissions,[]);
});
test('counts headers in the byte budget and reports documentation that does not fit',()=>{
 const text='def answer():\n    """'+'λ'.repeat(1000)+'"""\n    return 42';
 const result=packCodeFirst([{path:'a.py',score:.9,startLine:1,endLine:3,text}],180,new Map([['a.py',documentationRanges('a.py',text).ranges]]));
 ok(Buffer.byteLength(result.source)<=180);
 ok(result.source.includes('return 42'));
 deepStrictEqual(result.omissions,[{path:'a.py',startLine:2,endLine:2,kind:'documentation',reason:'output budget'}]);
});
test('deduplicates overlapping source and shared context after reordering',()=>{
 const text='class Store:\n    """shared-contract"""\n    def answer(self):\n        return 42';
 const result=packCodeFirst([
  {path:'a.py',score:.9,startLine:3,endLine:4,text:'    def answer(self):\n        return 42',contexts:[{startLine:1,endLine:2,text:'class Store:\n    """shared-contract"""'}]},
  {path:'a.py',score:.8,startLine:1,endLine:4,text},
 ],10000,new Map([['a.py',documentationRanges('a.py',text).ranges]]));
 deepStrictEqual(result.delivered.flatMap(r=>Array.from({length:r.endLine!-r.startLine!+1},(_,i)=>r.startLine!+i)).sort((a,b)=>a-b),[1,2,3,4]);
 deepStrictEqual((result.source.match(/return 42/g)??[]).length,1);
 deepStrictEqual((result.source.match(/shared-contract/g)??[]).length,1);
});
test('keeps mixed code/docstring statements and ordinary string data together',()=>{
 const text='def café(): """contract\nsecond line\n"""; return "ok"\nTEXT = """plain data\nkeep"""';
 const result=documentationRanges('a.py',text);
 deepStrictEqual(result.method,'python-docstrings');
 deepStrictEqual(result.ranges,[]);
});
test('keeps a fitting narrow selection when its larger overlap exceeds the budget',()=>{
 const result=packCodeFirst([
  {path:'a.py',score:.9,startLine:1,endLine:2,text:'# '+ 'x'.repeat(300)+'\nreturn 42'},
  {path:'a.py',score:.8,startLine:2,endLine:2,text:'return 42'},
 ],100,new Map());
 ok(result.source.includes('return 42'));
 deepStrictEqual(result.delivered,[{path:'a.py',startLine:2,endLine:2}]);
});
