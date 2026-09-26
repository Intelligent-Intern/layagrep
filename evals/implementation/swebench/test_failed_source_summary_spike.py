"""The leading summary exposes failed source screening without calling it negative."""
import http.server,json,pathlib,subprocess,tempfile,threading,os
ROOT=pathlib.Path(__file__).resolve().parents[3]
source=ROOT/os.environ.get('JEV_SPIKE_SOURCE','evals/implementation/swebench/hierarchy-summary-spike.ts')
class Gateway(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  data=json.loads(self.rfile.read(int(self.headers['content-length'])))
  if any(i['kind']=='chunk' for i in data['state']['items']):
   body=b'{"error":{"message":"temporary source screening outage"}}';self.send_response(503)
  else:
   body=json.dumps({'answers':{k:{'type':'boolean','probability':.9} for k in data['questions']},'usage':{'inputTokens':20,'outputTokens':2}}).encode();self.send_response(200)
  self.send_header('content-type','application/json');self.send_header('content-length',str(len(body)));self.end_headers();self.wfile.write(body)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Gateway);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-summary-') as d:
  p=pathlib.Path(d);repo=p/'repo';repo.mkdir();(repo/'feature.py').write_text('def emit():\n    return "SOURCE_NOT_SCREENED"\n')
  bundle=p/'spike.mjs';subprocess.run(['bun','build',str(source),'--target=node','--outfile='+str(bundle)],check=True,capture_output=True)
  env=dict(os.environ,AI_GATEWAY_API_KEY='synthetic-only',AI_GATEWAY_BASE_URL=f'http://127.0.0.1:{server.server_port}')
  run=subprocess.run(['node',str(bundle),'--root',str(repo),'--query','Find telemetry','--metrics',str(p/'metrics.json'),'--context','chunks'],env=env,capture_output=True,text=True,timeout=30)
  assert run.returncode==0,run.stderr
  summary=run.stdout.split('--- End summary')[0]
  assert 'Unscored source excerpts: 1' in summary,'Leading summary hides failed source screening'
  assert 'Failed/unscored navigation entries: 0' in summary
  record=json.loads((p/'metrics.json').read_text());assert record['status']=='partial'
  assert any(o['path']=='feature.py' and o['reason']=='source screening incomplete' for o in record['omissions'])
  assert not any(d['kind']=='chunk' and d['decision']=='below-threshold' for d in record['decisions'])
  assert 'SOURCE_NOT_SCREENED' not in run.stdout
  print('PASS: first-screen summary distinguishes failed source screening from navigation and negatives')
finally:server.shutdown();server.server_close();thread.join()
