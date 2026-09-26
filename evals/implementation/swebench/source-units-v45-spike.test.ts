import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sourceUnits} from './source-units-v45-spike';
test('a later function excerpt retains its verbatim decorated signature',()=>{
 const text=['@tracked','def collect(event, sink):',...Array.from({length:220},(_,i)=>`    padding_${i} = "some otherwise uninformative padding"`),'    sink.emit(event)',''].join('\n');
 const result=sourceUnits('signals.py',text);
 const tail=result.parts.find(p=>p.text.includes('sink.emit(event)'))!;
 assert(tail.startLine>2);
 assert(tail.contexts?.some(c=>c.startLine===1&&c.endLine===2&&c.text==='@tracked\ndef collect(event, sink):'),JSON.stringify({method:result.method,fallback:result.fallback,contexts:tail.contexts}));
});
test('nested function excerpts retain enclosing scopes without an unrelated sibling',()=>{
 const text=['class Bus:','    """Dispatch events."""','    def route(self, event):','        def emit(sink):',...Array.from({length:180},(_,i)=>`            padding_${i} = "some otherwise uninformative padding"`),'            sink.send(event)','        return emit','    def unrelated(self):','        return None',''].join('\n');
 const result=sourceUnits('signals.py',text);
 const tail=result.parts.find(p=>p.text.includes('sink.send(event)'))!;
 const contexts=tail.contexts?.map(c=>c.text)??[];
 assert(contexts.some(c=>c.startsWith('class Bus:')));
 assert(contexts.includes('    def route(self, event):'));
 assert(contexts.includes('        def emit(sink):'));
 assert(!contexts.some(c=>c.includes('def unrelated')));
});
test('an outer header does not absorb the first nested declaration decorator',()=>{
 const text=['def outer(sink):','    @tracked','    def inner():','        return 1',...Array.from({length:150},(_,i)=>`    padding_${i} = "some otherwise uninformative padding"`),'    sink.send(inner())',''].join('\n');
 const result=sourceUnits('signals.py',text);const tail=result.parts.find(p=>p.text.includes('sink.send(inner())'))!;
 assert(tail.contexts?.some(c=>c.startLine===1&&c.endLine===1&&c.text==='def outer(sink):'));
 assert(!tail.contexts?.some(c=>c.text.includes('@tracked')));
});
test('a function declared inside a conditional retains its own signature',()=>{
 const text=['def outer(enabled):','    if enabled:','        def emit(sink):',...Array.from({length:150},(_,i)=>`            padding_${i} = "some otherwise uninformative padding"`),'            sink.send()','        return emit',''].join('\n');
 const tail=sourceUnits('signals.py',text).parts.find(p=>p.text.includes('sink.send()'))!;
 assert(tail.contexts?.some(c=>c.text==='        def emit(sink):'));
});
