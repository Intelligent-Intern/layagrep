import {spawnSync} from 'node:child_process';
import type {FileHandle} from 'node:fs/promises';
import {extname} from 'node:path';
import parser from './content-handoff-v47-spike.py' with {type:'text'};
export type ContentPreview={sizeBytes:number;extension:string;text:string;previewBytes:number;truncated:boolean;range:'opening bytes'|'sampled source ranges'};
export type PreviewSpan={sourceByteStart:number;sourceByteEnd:number;startLine:number;endLine:number;text:string;basis:string;partialLine?:boolean;columnStartByte?:number;columnEndByte?:number};
export type PreviewAudit={path:string;readBytes:number;parserMs:number;method:string;fallback?:string;matchedDeclarations?:number;unrepresentedMatches?:number;parseUnavailable?:boolean};
const privateKey=/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
function decode(bytes:Buffer,partial=false){const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes,{stream:partial});if(text.includes('\0')||privateKey.test(text))throw new Error('Binary/private key material');return text;}
export async function contentPreview(handle:FileHandle,path:string,query:string,onRead?:(bytes:number)=>void):Promise<{preview:ContentPreview;audit:PreviewAudit;spans:PreviewSpan[]}>{
 const info=await handle.stat();if(!info.isFile())throw new Error('Nonregular file');
 const opening=Buffer.alloc(16384);let used=0;
 while(used<opening.length){const r=await handle.read(opening,used,opening.length-used,used);if(!r.bytesRead)break;used+=r.bytesRead;onRead?.(r.bytesRead);}
 const audit:PreviewAudit={path,readBytes:used,parserMs:0,method:'opening bytes'};
 let truncated=info.size>used,text=decode(opening.subarray(0,used),truncated);
 while(Buffer.byteLength(JSON.stringify(text))>24000){let end=Math.floor(text.length*.75);const last=text.charCodeAt(end-1);if(last>=0xd800&&last<=0xdbff)end--;text=text.slice(0,end);truncated=true;}
 const spans:PreviewSpan[]=[{sourceByteStart:0,sourceByteEnd:Buffer.byteLength(text),startLine:1,endLine:text.split('\n').length,text,basis:truncated?'opening context':'complete source',partialLine:truncated}];
 const preview:ContentPreview={sizeBytes:info.size,extension:extname(path),text,previewBytes:Buffer.byteLength(text),truncated,range:'opening bytes'};
 if(!truncated||!['.py','.pyi'].includes(preview.extension))return{preview,audit,spans};
 if(info.size>1_000_000){audit.fallback='source exceeds local preview inspection bound';return{preview,audit,spans};}
 const complete=Buffer.alloc(info.size+1);opening.copy(complete,0,0,used);let count=used;
 while(count<complete.length){const r=await handle.read(complete,count,complete.length-count,count);if(!r.bytesRead)break;count+=r.bytesRead;audit.readBytes+=r.bytesRead;onRead?.(r.bytesRead);}
 const after=await handle.stat();
 if(count!==info.size||after.size!==info.size||after.mtimeMs!==info.mtimeMs)throw new Error('Source changed during preview');
 const source=decode(complete.subarray(0,count));
 const tick=performance.now();
 const result=spawnSync('python3',['-I','-c',parser],{input:JSON.stringify({query,path,text:source,budget:16384}),encoding:'utf8',maxBuffer:2_000_000,timeout:5000});
 audit.parserMs=performance.now()-tick;
 if(result.status!==0){audit.fallback='preview parser process unavailable';return{preview,audit,spans};}
 try{
  const value=JSON.parse(result.stdout);
  if(typeof value.text!=='string'||!value.text||Buffer.byteLength(value.text)>16384||Buffer.byteLength(JSON.stringify(value.text))>24000||value.truncated!==true)throw new Error('Invalid sampled preview');
  if(!Array.isArray(value.spans)||!value.spans.length)throw new Error('Preview ranges unavailable');
  const lines=source.split('\n');
  for(const span of value.spans){
   if(!Number.isInteger(span.startLine)||!Number.isInteger(span.endLine)||span.startLine<1||span.endLine<span.startLine||span.endLine>lines.length||typeof span.text!=='string'||typeof span.basis!=='string')throw new Error('Invalid preview span');
   if(!Number.isInteger(span.sourceByteStart)||!Number.isInteger(span.sourceByteEnd)||span.sourceByteStart<0||span.sourceByteEnd<span.sourceByteStart||span.sourceByteEnd>Buffer.byteLength(source)||Buffer.from(source).subarray(span.sourceByteStart,span.sourceByteEnd).toString()!==span.text)throw new Error('Invalid source byte interval');
   const original=lines.slice(span.startLine-1,span.endLine).join('\n');
   if(span.columnStartByte!==undefined){if(span.startLine!==span.endLine||!Number.isInteger(span.columnStartByte)||!Number.isInteger(span.columnEndByte)||span.columnStartByte<0||span.columnEndByte<span.columnStartByte||Buffer.from(original).subarray(span.columnStartByte,span.columnEndByte).toString()!==span.text)throw new Error('Invalid inline preview span');}
   else if(span.partialLine?!original.includes(span.text):original!==span.text)throw new Error('Preview span differs from source');
  }
  return{spans:value.spans,preview:{...preview,text:value.text,previewBytes:Buffer.byteLength(value.text),truncated:true,range:'sampled source ranges'},audit:{...audit,method:value.method,matchedDeclarations:value.matchedDeclarations,unrepresentedMatches:value.unrepresentedMatches,parseUnavailable:value.parseUnavailable}};
 }catch{audit.fallback='preview parser result unavailable or exceeds payload bound';return{preview,audit,spans};}
}
