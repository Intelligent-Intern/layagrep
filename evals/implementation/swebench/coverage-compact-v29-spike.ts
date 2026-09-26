// Stdout navigation keeps exact paths/statuses; numeric scores remain in the full report.
export function formatNavigationCoverage(records:Record<string,unknown>[]){
 const groups=new Map<string,{common:Record<string,unknown>;parents:Map<string,string[]>}>();
 for(const {path,score: _score,...common} of records){
  if(typeof path!=='string')throw new Error('Navigation coverage requires a path');
  const key=JSON.stringify(Object.entries(common).sort(([a],[b])=>a.localeCompare(b)));let group=groups.get(key);
  if(!group){group={common,parents:new Map()};groups.set(key,group);}
  const split=path.lastIndexOf('/'),parent=split<0?'.':path.slice(0,split),name=path.slice(split+1);
  const names=group.parents.get(parent)??[];names.push(name);group.parents.set(parent,names);
 }
 return [...groups.values()].map(g=>`group ${JSON.stringify(g.common)}\npaths ${JSON.stringify(Object.fromEntries(g.parents))}`).join('\n');
}
