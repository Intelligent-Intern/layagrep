import {previewFragments} from './preview-fragments-v51-spike';

// Coverage probe: fixed-size source units deliberately avoid declaration-name sampling.
export function completeSourceFragments(bytes:Buffer,limit=3500){
 const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
 if(text.includes('\0')||/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text))throw new Error('Binary/private key material');
 if(!bytes.length)return [];
 return previewFragments([{text,sourceByteStart:0,sourceByteEnd:bytes.length,startLine:1,endLine:text.split('\n').length,basis:'complete-file inspection'}],limit);
}
