import {test} from 'node:test';
import {deepStrictEqual,ok} from 'node:assert';
import {formatNavigationCoverage} from './coverage-compact-v29-spike';

test('retains every navigation status and unusual path while sharing directory prefixes',()=>{
 const records=[
  {kind:'file',decision:'below-threshold',path:'src/nested/one.py',score:.2},
  {path:'src/nested/two"\n.py',score:.3,decision:'below-threshold',kind:'file'},
  {kind:'directory',decision:'pruned-descendants-unchecked',path:'src/other',score:.1},
  {kind:'file',decision:'preview-unavailable',path:'__proto__/unknown.py',reason:'unreadable'},
  {kind:'directory',decision:'enumeration-failed',path:'.'},
 ];
 const output=formatNavigationCoverage(records);const decoded:Record<string,unknown>[]=[];
 let common:Record<string,unknown>={};
 for(const line of output.split('\n')){
  if(line.startsWith('group '))common=JSON.parse(line.slice(6));
  if(line.startsWith('paths '))for(const [parent,names] of Object.entries(JSON.parse(line.slice(6)))){
   for(const name of names as string[])decoded.push({...common,path:parent==='.'?name:`${parent}/${name}`});
  }
 }
 const canonical=(rows:Record<string,unknown>[])=>rows.map(r=>JSON.stringify(Object.fromEntries(Object.entries(r).sort()))).sort();
 deepStrictEqual(canonical(decoded),canonical(records.map(({score,...r})=>r)));
 ok(!output.includes('"score"'));
 ok(output.split('src/nested').length===2,'Shared parent should appear once in this status group');
});
