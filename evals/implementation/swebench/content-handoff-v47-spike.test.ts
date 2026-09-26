import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,open,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {contentPreview} from './content-handoff-v47-spike';
test('a clipped Unicode opening remains a partial exact prefix',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'jev-preview-'));
 try{const text='é'.repeat(20000);const path=join(dir,'notes.txt');await writeFile(path,text);const handle=await open(path,'r');
  try{const result=await contentPreview(handle,'notes.txt','query');assert.equal(result.preview.truncated,true);assert.equal(result.spans[0]!.partialLine,true);assert.equal(result.spans[0]!.sourceByteStart,0);assert.equal(result.spans[0]!.sourceByteEnd,Buffer.byteLength(result.spans[0]!.text));assert.ok(text.startsWith(result.spans[0]!.text));assert.equal(result.spans[0]!.startLine,1);assert.equal(result.spans[0]!.endLine,1);assert.ok(!result.spans[0]!.text.includes('\uFFFD'));}finally{await handle.close();}
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('deep query windows retain exact source including UTF-8 inline spans',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'jev-preview-'));
 try{const text=Array.from({length:1000},(_,i)=>`p${i} = "padding words"`).join('\n')+'\ndef café(): "doc"; return "é"\n';const path=join(dir,'code.py');await writeFile(path,text);const handle=await open(path,'r');
  try{const result=await contentPreview(handle,'code.py','How does café work?');assert.equal(result.audit.method,'query-assisted source windows');assert.ok(result.spans.some(s=>s.text.includes('return "é"')));const lines=text.split('\n');
   for(const s of result.spans){assert.equal(Buffer.from(text).subarray(s.sourceByteStart,s.sourceByteEnd).toString(),s.text);let expected=lines.slice(s.startLine-1,s.endLine).join('\n');if(s.columnStartByte!==undefined)expected=Buffer.from(expected).subarray(s.columnStartByte,s.columnEndByte).toString();assert.equal(s.text,expected);}
  }finally{await handle.close();}
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('JSON allowance trimming preserves astral Unicode source bytes',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'jev-preview-'));
 try{const text='\u0001'.repeat(3885)+'😀'+'\u0001'.repeat(12495)+'tail';const path=join(dir,'escaped.txt');await writeFile(path,text);const handle=await open(path,'r');
  try{const result=await contentPreview(handle,'escaped.txt','query');const body=result.spans[0]!.text;assert.ok(Buffer.from(body).toString()===body,'Trimmed source has an unpaired surrogate');assert.ok(text.startsWith(body));}finally{await handle.close();}
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('a sampled suffix of a long line identifies its actual byte offset',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'jev-preview-'));
 try{const text='value = "'+'é'.repeat(15000)+'"';const path=join(dir,'long.py');await writeFile(path,text);const handle=await open(path,'r');
  try{const result=await contentPreview(handle,'long.py','unmatched');assert.equal(result.audit.method,'query-assisted source windows');const suffix=result.spans.find(s=>s.partialLine&&s.sourceByteStart>0);assert.ok(suffix);assert.equal(suffix.sourceByteEnd,Buffer.byteLength(text));assert.equal(Buffer.from(text).subarray(suffix.sourceByteStart,suffix.sourceByteEnd).toString(),suffix.text);}finally{await handle.close();}
 }finally{await rm(dir,{recursive:true,force:true});}
});
