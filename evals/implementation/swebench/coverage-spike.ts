// Disposable output experiment: group repeated metadata without discarding coverage.
export function formatCoverage(records:Record<string,unknown>[]){
 const groups=new Map<string,{common:Record<string,unknown>;fields:string[];rows:unknown[][]}>();
 for(const record of records){
  const groupingKeys='startLine' in record?['path','kind','decision','reason']:['kind','decision','reason'];
  const common=Object.fromEntries(groupingKeys.filter(key=>record[key]!==undefined).map(key=>[key,record[key]]));
  const fields=Object.keys(record).filter(key=>!(key in common)&&record[key]!==undefined).sort();
  const key=JSON.stringify([common,fields]);
  let group=groups.get(key);
  if(!group){group={common,fields,rows:[]};groups.set(key,group);}
  group.rows.push(fields.map(field=>record[field]));
 }
 return [...groups.values()].map(group=>`group ${JSON.stringify(group.common)}\nfields ${JSON.stringify(group.fields)}\n${group.rows.map(row=>JSON.stringify(row)).join('\n')}`).join('\n');
}
