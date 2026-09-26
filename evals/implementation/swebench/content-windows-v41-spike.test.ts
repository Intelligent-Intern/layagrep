import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,open,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {contentPreview} from './content-windows-v41-spike';
async function inspect(text:string,name='a.py',query='beacon'){
 const dir=await mkdtemp(join(tmpdir(),'jev-preview-'));const path=join(dir,name);let reads=0;
 try{await writeFile(path,text);const handle=await open(path,'r');try{return{...await contentPreview(handle,name,query,n=>{reads+=n;}),reads};}finally{await handle.close();}}
 finally{await rm(dir,{recursive:true,force:true});}
}
test('deep declaration is exposed by a partial preview, never passed off as complete source',async()=>{
 const padding=Array.from({length:1600},(_,i)=>`padding_${i} = ${i}`).join('\n')+'\n';
 const text=padding+'def beacon():\n    return "deep telemetry"\n'+padding;
 const {preview,audit,reads}=await inspect(text);
 assert.ok(preview.text.includes('deep telemetry'));assert.equal(preview.truncated,true);assert.equal(preview.range,'sampled source ranges');assert.equal(reads,Buffer.byteLength(text));assert.equal(audit.readBytes,reads);assert.ok(preview.previewBytes<=16384);
});
test('small files remain complete and giant or unsupported files use bounded opening content',async()=>{
 const small='def beacon(): return 3\n';assert.equal((await inspect(small)).preview.text,small);
 const giant=await inspect('#'.repeat(1_000_001));assert.equal(giant.reads,16384);assert.equal(giant.preview.range,'opening bytes');assert.ok(giant.audit.fallback);
 const other=await inspect('x'.repeat(30000),'a.ts');assert.equal(other.reads,16384);assert.equal(other.preview.truncated,true);
});
test('full-preview inspection rejects private-key material beyond the opening',async()=>{
 await assert.rejects(inspect('# padding\n'.repeat(2000)+'key = "-----BEGIN PRIVATE KEY-----"\n'),/private key/);
});
