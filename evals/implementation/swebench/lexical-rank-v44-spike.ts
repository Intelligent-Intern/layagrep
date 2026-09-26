// Disposable local candidate ranking. A skipped item is semantically unknown.
// Scores select work for Jev; they are not semantic relevance probabilities.
export type LexicalDocument={path:string;text:string;startLine?:number;endLine?:number};
const stop=new Set('a an the is are was were be been being do does did to of in on for from with and or not how why where what when which this that these those can could would should must find code implementation behavior query return'.split(' '));
export function lexicalTokens(text:string):string[]{return (text.normalize('NFKC').toLowerCase().match(/[\p{L}_][\p{L}\p{M}\p{N}_]*/gu)??[]).filter(t=>t.length>1&&!stop.has(t));}
export function rankLexical(documents:LexicalDocument[],query:string,fraction=.25){
 if(!Number.isFinite(fraction)||fraction<=0||fraction>1)throw new Error('Relative lexical threshold must be in (0,1]');
 const terms=[...new Set(lexicalTokens(query))];
 const vectors=documents.map(document=>{const tokens=lexicalTokens(document.text);const counts=new Map<string,number>();for(const token of tokens)counts.set(token,(counts.get(token)??0)+1);return{length:tokens.length,counts};});
 const average=vectors.reduce((n,v)=>n+v.length,0)/Math.max(1,vectors.length)||1;
 const frequencies=new Map(terms.map(term=>[term,vectors.filter(v=>v.counts.has(term)).length]));
 const idf=new Map(terms.map(term=>[term,Math.log(1+(documents.length-frequencies.get(term)!+.5)/(frequencies.get(term)!+.5))]));
 const scores=vectors.map(v=>{let score=0;const matchedTerms:string[]=[];for(const term of terms){const count=v.counts.get(term)??0;if(!count)continue;matchedTerms.push(term);score+=idf.get(term)!*(count*2.2)/(count+1.2*(.25+.75*v.length/average));}return{score,matchedTerms};});
 const maximum=scores.reduce((max,s)=>Math.max(max,s.score),0),threshold=maximum*fraction;
 return{terms,documentFrequencies:Object.fromEntries(frequencies),maximum,threshold,relativeThreshold:fraction,decisions:scores.map((s,index)=>({index,path:documents[index]!.path,startLine:documents[index]!.startLine,endLine:documents[index]!.endLine,...s,selected:s.score>0&&s.score>=threshold}))};
}
