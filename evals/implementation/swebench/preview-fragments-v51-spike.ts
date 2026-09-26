import type {PreviewSpan} from './content-handoff-v47-spike';
export function previewFragments(spans:PreviewSpan[],limit=1500):PreviewSpan[]{
 if(!Number.isInteger(limit)||limit<4)throw new Error('Fragment allowance must fit a Unicode code point');
 const result:PreviewSpan[]=[];
 for(const span of spans){
  const bytes=Buffer.from(span.text);if(bytes.length!==span.sourceByteEnd-span.sourceByteStart)throw new Error('Source interval mismatch');
  if(!bytes.length){result.push({...span});continue;}
  let cursor=0,line=span.startLine;
  while(cursor<bytes.length){
   let end=Math.min(bytes.length,cursor+limit);
   if(end<bytes.length){const newline=bytes.lastIndexOf(10,end-1);if(newline>=cursor)end=newline+1;else while(end>cursor&&(bytes[end]!&0xc0)===0x80)end--;}
   if(end<=cursor)throw new Error('Fragment did not advance');
   const text=new TextDecoder('utf8',{fatal:true}).decode(bytes.subarray(cursor,end));const newlines=(text.match(/\n/g)??[]).length;
   const {columnStartByte,columnEndByte,...base}=span;
   result.push({...base,text,startLine:line,endLine:line+newlines-(text.endsWith("\n")?1:0),sourceByteStart:span.sourceByteStart+cursor,sourceByteEnd:span.sourceByteStart+end,partialLine:span.partialLine||cursor>0&&bytes[cursor-1]!==10||end<bytes.length&&bytes[end-1]!==10});
   line+=newlines;cursor=end;
  }
 }
 return result;
}
