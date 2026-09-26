import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handoffManifest} from './handoff-manifest-v39-spike';
test('caller source appears even when the whole-file check is unavailable',()=>{
 const lines=handoffManifest([{path:'caller.py',startLine:161,endLine:177},{path:'chosen.py',startLine:4,endLine:8}],[{path:'chosen.py',score:.8}],[{path:'caller.py',kind:'file',decision:'below-threshold',score:.15},{path:'caller.py',kind:'related-file',decision:'unscored-after-interruption',reason:'provider unavailable'}]);
 assert.ok(lines.some(s=>s.includes('"caller.py"')&&s.includes('161-177')&&s.includes('unavailable')));
 assert.ok(!lines.some(s=>s.includes('"caller.py"')&&s.includes('no source returned')));
});
test('ranges preserve gaps and a later accepted recheck supersedes a file failure',()=>{
 const lines=handoffManifest([{path:'a.py',startLine:3,endLine:6},{path:'a.py',startLine:5,endLine:8},{path:'a.py',startLine:12,endLine:13}],[{path:'a.py',score:.8},{path:'missing.py',score:.7}],[{path:'a.py',kind:'file',decision:'unscored-after-interruption'},{path:'a.py',kind:'related-file',decision:'relevant',score:.8}]);
 assert.ok(lines.some(s=>s.includes('"a.py"')&&s.includes('lines 3-8, 12-13')&&s.includes('accepted')));
 assert.ok(!lines.some(s=>s.includes('"a.py"')&&s.includes('unavailable')));
 assert.ok(lines.some(s=>s.includes('"missing.py"')&&s.includes('no source returned')));
});
test('a delivered excerpt does not hide a failed source check elsewhere in the file',()=>{
 const lines=handoffManifest([{path:'mixed.py',startLine:1,endLine:5}],[{path:'mixed.py',score:.9}],[{path:'mixed.py',kind:'file',decision:'relevant',score:.9}],[{path:'mixed.py',startLine:20,endLine:30,reason:'source screening incomplete'}]);
 assert.ok(lines.some(s=>s.includes('mixed.py')&&s.includes('20-30')&&s.includes('source screening incomplete')));
});
