"""Regenerate synthetic expectations in a Python container with /reference read-only."""
import io,json,sys,contextlib,hashlib
from pathlib import Path
corpus=json.load(sys.stdin)
cases=corpus["cases"] if isinstance(corpus,dict) else corpus
helpers=['source-method-declarations-spike.py','content-handoff-v47-spike.py','source-neighborhood-spike.py']
for case in cases:
    results={}
    for helper in helpers:
        request=case['source'] if helper==helpers[0] else json.dumps({'source':case['source'],'ranges':case['selected'],'text':case['source'],'query':case['query'],'path':case['path'],'budget':case['budget']})
        sys.stdin=io.StringIO(request)
        captured=io.StringIO()
        try:
            with contextlib.redirect_stdout(captured):exec(compile(Path('/reference',helper).read_text(),helper,'exec'),{'__name__':'__main__'})
            results[helper]=json.loads(captured.getvalue())
        except (SyntaxError,ValueError,RecursionError) as error:results[helper]={'error':type(error).__name__}
    case['reference']=results
print(json.dumps({'helpers':{name:hashlib.sha256(Path('/reference',name).read_bytes()).hexdigest() for name in helpers},'cases':cases},indent=2,ensure_ascii=False))
