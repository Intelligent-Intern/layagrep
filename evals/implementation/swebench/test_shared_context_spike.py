"""CLI regression: shared class context keeps method identity without repeated text."""
import http.server,json,pathlib,subprocess,tempfile,threading,os
ROOT=pathlib.Path(__file__).resolve().parents[3]
source=ROOT/os.environ.get('JEV_SPIKE_SOURCE','evals/implementation/swebench/hierarchy-shared-spike.ts');seen=[]
class Gateway(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  x=json.loads(self.rfile.read(int(self.headers['content-length'])));seen.append(x);state=x['state'];answers={}
  for i,(key,question) in enumerate(x['questions'].items()):
   item=state['items'][i];contexts=[]
   for context in item.get('contexts',[]):
    if 'text' in context:contexts.append(context)
    else:
     matches=[c for c in state.get('enclosingContexts',[]) if all(c[k]==context[k] for k in ['path','startLine','endLine'])];assert len(matches)==1;contexts.extend(matches)
   probability=.9
   if 'METHOD_' in item.get('text',''):probability=.9 if any('TelemetryStore' in c['text'] for c in contexts) else .1
   if 'class NoiseStore' in item.get('text',''):probability=.1
   answers[key]={'type':'boolean','probability':probability}
  body=json.dumps({'answers':answers,'usage':{'inputTokens':20,'outputTokens':2}}).encode();self.send_response(200);self.send_header('content-type','application/json');self.send_header('content-length',str(len(body)));self.end_headers();self.wfile.write(body)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Gateway);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-shared-') as d:
  p=pathlib.Path(d);repo=p/'repo';repo.mkdir()
  for filename,classname,marker in [('telemetry.py','TelemetryStore','KEEP'),('noise.py','NoiseStore','DROP')]:
   (repo/filename).write_text(f'class {classname}:\n    """'+'Context description. '*100+'"""\n'+''.join(f'    def save_{i}(self):\n        return "METHOD_{marker}_{i}"\n' for i in range(8)))
  bundle=p/'spike.mjs';subprocess.run(['bun','build',str(source),'--target=node','--outfile='+str(bundle)],check=True,capture_output=True)
  metrics=p/'result.json';env=dict(os.environ,AI_GATEWAY_API_KEY='synthetic-only',AI_GATEWAY_BASE_URL=f'http://127.0.0.1:{server.server_port}')
  run=subprocess.run(['node',str(bundle),'--root',str(repo),'--query','Find telemetry storage methods','--metrics',str(metrics),'--context','chunks'],env=env,capture_output=True,text=True,timeout=30);assert run.returncode==0,run.stderr
  for i in range(8):assert f'METHOD_KEEP_{i}' in run.stdout
  assert 'METHOD_DROP_' not in run.stdout
  for request in seen:
   state=request['state'];refs=[c for i in state['items'] for c in i.get('contexts',[])]
   if refs:
    assert all('text' not in c for c in refs),'Enclosing text still repeats in each excerpt'
    keys=[(c['path'],c['startLine'],c['endLine']) for c in state['enclosingContexts']];assert len(keys)==len(set(keys))
  assert any(r['state'].get('enclosingContexts') for r in seen)
  print('PASS: all telemetry methods retain identity, noise methods excluded, enclosing text shared exactly once per request')
finally:server.shutdown();server.server_close();thread.join()
