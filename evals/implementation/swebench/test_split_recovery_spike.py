"""CLI recovers source context by subdividing a transiently failing batch."""
import http.server,json,pathlib,subprocess,tempfile,threading,os
ROOT=pathlib.Path(__file__).resolve().parents[3]
source=ROOT/os.environ.get('JEV_SPIKE_SOURCE','evals/implementation/swebench/hierarchy-split-spike.ts')
class Gateway(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  data=json.loads(self.rfile.read(int(self.headers['content-length'])));items=data['state']['items']
  if items[0]['kind']=='chunk' and (len(items)>1 or os.environ.get('PERSISTENT_SOURCE_FAILURE')=='1' and 'DIRECT_CONTEXT' in items[0].get('text','')):
   self.send_response(503);body=b'{"error":{"message":"temporary batch failure"}}'
  else:
   self.send_response(200);body=json.dumps({'answers':{key:{'type':'boolean','probability':.95 if items[i]['kind']=='file' or 'DIRECT_CONTEXT' in items[i].get('text','') else .1} for i,key in enumerate(data['questions'])},'usage':{'inputTokens':20,'outputTokens':2}}).encode()
  self.send_header('content-type','application/json');self.send_header('content-length',str(len(body)));self.end_headers();self.wfile.write(body)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Gateway);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-split-') as d:
  p=pathlib.Path(d);repo=p/'repo';repo.mkdir();(repo/'feature.py').write_text('def emit():\n    return "DIRECT_CONTEXT"\n\ndef other():\n    return "UNRELATED_CONTEXT"\n')
  bundle=p/'spike.mjs';subprocess.run(['bun','build',str(source),'--target=node','--outfile='+str(bundle)],check=True,capture_output=True)
  env=dict(os.environ,AI_GATEWAY_API_KEY='synthetic-only',AI_GATEWAY_BASE_URL=f'http://127.0.0.1:{server.server_port}')
  run=subprocess.run(['node',str(bundle),'--root',str(repo),'--query','Find telemetry','--metrics',str(p/'metrics.json'),'--context','chunks'],env=env,capture_output=True,text=True,timeout=30)
  assert run.returncode==0,run.stderr
  record=json.loads((p/'metrics.json').read_text())
  if os.environ.get('PERSISTENT_SOURCE_FAILURE')=='1':
   assert 'DIRECT_CONTEXT' not in run.stdout
   assert record['status']=='partial' and any(o['reason']=='source screening incomplete' for o in record['omissions'])
   assert any(c.get('error') and not c.get('recovered') for c in record['calls'])
   assert len(record['selected'])==0
   print('PASS: persistent singleton failure terminates with honest incomplete coverage')
  else:
   assert 'DIRECT_CONTEXT' in run.stdout,'Transient batch failure loses recoverable source'
   assert 'UNRELATED_CONTEXT' not in run.stdout
   assert record['status']=='complete' and not record['omissions']
   assert any(c.get('error') for c in record['calls']) and all(c.get('recovered') for c in record['calls'] if c.get('error'))
   assert any(d['kind']=='chunk' and d['decision']=='below-threshold' for d in record['decisions'])
   print('PASS: subdivision recovers useful source, accurate negatives and complete coverage')

finally:server.shutdown();server.server_close();thread.join()
