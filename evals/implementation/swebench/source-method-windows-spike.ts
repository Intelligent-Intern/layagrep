import ts from 'typescript';
import {spawnSync} from 'node:child_process';
import declarationParser from './source-method-declarations-spike.py' with {type:'text'};

export type Range={startLine:number;endLine:number};
export type Unit=Range&{name:string};
export function inspectSource(path:string,source:string):{units:Unit[];comments:Range[]}{
 const units:Unit[]=[],comments:Range[]=[];
 if(/\.pyi?$/.test(path)){
  const parsed=spawnSync('python3',['-I','-c',declarationParser],{input:source,encoding:'utf8',timeout:5000,maxBuffer:2_000_000});
  if(parsed.status===0){try{units.push(...JSON.parse(parsed.stdout));}catch{}}
  // Python comments are single-line; a conservative match also works if Python is absent.
  source.split('\n').forEach((line,i)=>{if(/^\s*#/.test(line))comments.push({startLine:i+1,endLine:i+1});});
 }else if(/\.(?:[cm]?[jt]s|[jt]sx)$/.test(path)){
  const kind=/\.tsx$/.test(path)?ts.ScriptKind.TSX:/\.jsx$/.test(path)?ts.ScriptKind.JSX:/\.[cm]?js$/.test(path)?ts.ScriptKind.JS:ts.ScriptKind.TS;
  const file=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,kind);
  const line=(pos:number)=>file.getLineAndCharacterOfPosition(pos).line+1;
  const add=(node:ts.Node,prefix='')=>{
   const named=node as ts.Node&{name?:ts.Node};
   const name=prefix+(named.name?.getText(file)||(ts.isVariableStatement(node)?node.declarationList.declarations.map(d=>d.name.getText(file)).join(', '):'source'));
   if(ts.isClassDeclaration(node)&&node.members.length){const first=line(node.members[0]!.getStart(file));const start=line(node.getStart(file));if(first>start)units.push({name:name+'.context',startLine:start,endLine:first-1});for(const member of node.members)add(member,name+'.');return;}
   units.push({name,startLine:line(node.getStart(file)),endLine:line(Math.max(node.getStart(file),node.end-1))});
  };
  // On syntax errors, use text chunks instead of trusting recovered AST boundaries.
  if(!(file as ts.SourceFile&{parseDiagnostics?:unknown[]}).parseDiagnostics?.length){
   for(const statement of file.statements)add(statement);
  }
  const visit=(node:ts.Node)=>{
   for(const comment of [...(ts.getLeadingCommentRanges(source,node.getFullStart())||[]),...(ts.getTrailingCommentRanges(source,node.end)||[])])comments.push({startLine:line(comment.pos),endLine:line(comment.end-1)});
   ts.forEachChild(node,visit);
  };
  visit(file);
 }
 return{units,comments};
}

// The output unit is source plus local context, regardless of parser availability.
export function contextWindows(source:string,ranges:Range[],comments:Range[]):Range[]{
 const lines=source.split('\n');
 const windows=ranges.map(range=>({startLine:Math.max(1,range.startLine-3),endLine:Math.min(lines.length,range.endLine+3)}));
 for(const window of windows){
  let changed=true;
  while(changed){
   changed=false;
   for(const comment of comments){
    const before=comment.endLine<window.startLine&&lines.slice(comment.endLine,window.startLine-1).every(line=>!line.trim());
    const after=comment.startLine>window.endLine&&lines.slice(window.endLine,comment.startLine-1).every(line=>!line.trim());
    if((comment.startLine<=window.endLine&&comment.endLine>=window.startLine)||before||after){
     const start=Math.min(window.startLine,comment.startLine),end=Math.max(window.endLine,comment.endLine);
     if(start!==window.startLine||end!==window.endLine){window.startLine=start;window.endLine=end;changed=true;}
    }
   }
  }
 }
 const merged:Range[]=[];
 for(const window of windows.sort((a,b)=>a.startLine-b.startLine)){
  const last=merged.at(-1);
  if(last&&window.startLine<=last.endLine+1)last.endLine=Math.max(last.endLine,window.endLine);else merged.push({...window});
 }
 return merged;
}
