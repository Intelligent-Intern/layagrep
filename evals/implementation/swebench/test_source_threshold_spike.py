"""Navigation may retain a file whose borderline source excerpt is omitted."""
import http.server,json,pathlib,subprocess,tempfile,threading,os
ROOT=pathlib.Path(__file__).resolve().parents[3]
source=ROOT/os.environ.get('JEV_SPIKE_SOURCE','evals/implementation/swebench/hierarchy-selective-spike.ts')
class Gateway(http.server.BaseHTTPRequestHandler):
 attempts=0
 def log_message(self,*args):pass
 def do_POST(self):
  data=json.loads(self.rfile.read(int(self.headers['content-length'])))
  Gateway.attempts+=1
  items=data['state']['items']
  value={'answers':{key:{'type':'boolean','probability':(.65 if items[i]['kind']=='file' or 'BORDERLINE_SOURCE' in items[i].get('text','') else .9)} for i,key in enumerate(data['questions'])},'usage':{'inputTokens':20,'outputTokens':2}}
  body=json.dumps(value).encode();self.send_response(200);self.send_header('content-type','application/json');self.send_header('content-length',str(len(body)));self.end_headers();self.wfile.write(body)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Gateway)
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-recovery-') as d:
  p=pathlib.Path(d);bundle=p/'spike.mjs';repo=p/'repo';repo.mkdir()
  (repo/'feature.py').write_text('def wanted():\n    return \"DIRECT_SOURCE\"\n\ndef incidental():\n    return \"BORDERLINE_SOURCE\"\n')
  subprocess.run(['bun','build',str(source),'--target=node','--outfile='+str(bundle)],check=True,capture_output=True)
  metrics=p/'result.json';env=dict(os.environ,AI_GATEWAY_API_KEY='synthetic-only',AI_GATEWAY_BASE_URL=f'http://127.0.0.1:{server.server_port}')
  run=subprocess.run(['node',str(bundle),'--root',str(repo),'--query','Find telemetry','--metrics',str(metrics),'--context','chunks'],env=env,capture_output=True,text=True,timeout=30)
  assert run.returncode==0,run.stderr
  record=json.loads(metrics.read_text())
  assert 'DIRECT_SOURCE' in run.stdout,'Useful source lost with broad navigation'
  assert 'BORDERLINE_SOURCE' not in run.stdout,'Borderline source still enters agent context'
  assert any(d['kind']=='file' and d['decision']=='relevant' and d['score']==.65 for d in record['decisions'])
  assert any(d['kind']=='chunk' and d['decision']=='below-threshold' and d['score']==.65 for d in record['decisions']),'Rejected excerpt missing from negative evidence'
  assert record['status']=='complete'
  print('PASS: broad navigation, selective source, accurate negative evidence')

finally:server.shutdown();server.server_close();thread.join()
