import {spawnSync} from 'node:child_process';
import type {FileHandle} from 'node:fs/promises';
import {extname} from 'node:path';
import parser from './content-windows-v41-spike.py' with {type:'text'};
export type ContentPreview={sizeBytes:number;extension:string;text:string;previewBytes:number;truncated:boolean;range:'opening bytes'|'sampled source ranges'};
export type PreviewAudit={path:string;readBytes:number;parserMs:number;method:string;fallback?:string;matchedDeclarations?:number;unrepresentedMatches?:number;parseUnavailable?:boolean};
const privateKey=/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
function decode(bytes:Buffer,partial=false){const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes,{stream:partial});if(text.includes('\0')||privateKey.test(text))throw new Error('Binary/private key material');return text;}
export async function contentPreview(handle:FileHandle,path:string,query:string,onRead?:(bytes:number)=>void):Promise<{preview:ContentPreview;audit:PreviewAudit}>{
 const info=await handle.stat();if(!info.isFile())throw new Error('Nonregular file');
 const opening=Buffer.alloc(16384);let used=0;
 while(used<opening.length){const r=await handle.read(opening,used,opening.length-used,used);if(!r.bytesRead)break;used+=r.bytesRead;onRead?.(r.bytesRead);}
 const audit:PreviewAudit={path,readBytes:used,parserMs:0,method:'opening bytes'};
 let truncated=info.size>used,text=decode(opening.subarray(0,used),truncated);
 while(Buffer.byteLength(JSON.stringify(text))>24000){text=text.slice(0,Math.floor(text.length*.75));truncated=true;}
 const preview:ContentPreview={sizeBytes:info.size,extension:extname(path),text,previewBytes:Buffer.byteLength(text),truncated,range:'opening bytes'};
 if(!truncated||!['.py','.pyi'].includes(preview.extension))return{preview,audit};
 if(info.size>1_000_000){audit.fallback='source exceeds local preview inspection bound';return{preview,audit};}
 const complete=Buffer.alloc(info.size+1);opening.copy(complete,0,0,used);let count=used;
 while(count<complete.length){const r=await handle.read(complete,count,complete.length-count,count);if(!r.bytesRead)break;count+=r.bytesRead;audit.readBytes+=r.bytesRead;onRead?.(r.bytesRead);}
 const after=await handle.stat();
 if(count!==info.size||after.size!==info.size||after.mtimeMs!==info.mtimeMs)throw new Error('Source changed during preview');
 const source=decode(complete.subarray(0,count));
 const tick=performance.now();
 const result=spawnSync('python3',['-I','-c',parser],{input:JSON.stringify({query,path,text:source,budget:16384}),encoding:'utf8',maxBuffer:2_000_000,timeout:5000});
 audit.parserMs=performance.now()-tick;
 if(result.status!==0){audit.fallback='preview parser process unavailable';return{preview,audit};}
 try{
  const value=JSON.parse(result.stdout);
  if(typeof value.text!=='string'||!value.text||Buffer.byteLength(value.text)>16384||Buffer.byteLength(JSON.stringify(value.text))>24000||value.truncated!==true)throw new Error('Invalid sampled preview');
  return{preview:{...preview,text:value.text,previewBytes:Buffer.byteLength(value.text),truncated:true,range:'sampled source ranges'},audit:{...audit,method:value.method,matchedDeclarations:value.matchedDeclarations,unrepresentedMatches:value.unrepresentedMatches,parseUnavailable:value.parseUnavailable}};
 }catch{audit.fallback='preview parser result unavailable or exceeds payload bound';return{preview,audit};}
}
