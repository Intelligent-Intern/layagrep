"""Stdout retains file/folder signals; detailed rejected excerpts stay in the report."""
import http.server,json,pathlib,subprocess,tempfile,threading,os
ROOT=pathlib.Path(__file__).resolve().parents[3]
source=ROOT/os.environ.get('JEV_SPIKE_SOURCE','evals/implementation/swebench/hierarchy-packet-spike.ts')
class Gateway(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  data=json.loads(self.rfile.read(int(self.headers['content-length'])));items=data['state']['items']
  def score(i):return .9 if i['kind']=='file' and i['path']=='feature.py' or i['kind']=='chunk' and 'USEFUL_SOURCE' in i.get('text','') else .1
  body=json.dumps({'answers':{k:{'type':'boolean','probability':score(items[i])} for i,k in enumerate(data['questions'])},'usage':{'inputTokens':20,'outputTokens':2}}).encode();self.send_response(200);self.send_header('content-type','application/json');self.send_header('content-length',str(len(body)));self.end_headers();self.wfile.write(body)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Gateway);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-packet-') as d:
  p=pathlib.Path(d);repo=p/'repo';repo.mkdir();(repo/'unrelated').mkdir();(repo/'other.py').write_text('OTHER_FILE = True\n');(repo/'feature.py').write_text('def emit():\n    return "USEFUL_SOURCE"\n\ndef unrelated():\n    return "REJECTED_SOURCE"\n')
  bundle=p/'spike.mjs';subprocess.run(['bun','build',str(source),'--target=node','--outfile='+str(bundle)],check=True,capture_output=True)
  env=dict(os.environ,AI_GATEWAY_API_KEY='synthetic-only',AI_GATEWAY_BASE_URL=f'http://127.0.0.1:{server.server_port}');metrics=p/'metrics.json'
  run=subprocess.run(['node',str(bundle),'--root',str(repo),'--query','Find telemetry','--metrics',str(metrics),'--context','chunks'],env=env,capture_output=True,text=True,timeout=30);assert run.returncode==0,run.stderr
  def groups(text):
   return [json.loads(line[len('group '):]) for line in text.splitlines() if line.startswith('group ')]
  rejected=lambda g:g.get('kind')=='chunk' and g.get('decision')=='below-threshold'
  assert not any(rejected(g) for g in groups(run.stdout)),'Detailed rejected excerpts still consume stdout'
  full=pathlib.Path(str(metrics)+'.context.txt').read_text();record=json.loads(metrics.read_text())
  assert any(rejected(g) for g in groups(full)),'Full report lost rejected excerpt evidence'
  assert 'USEFUL_SOURCE' in run.stdout and 'REJECTED_SOURCE' not in run.stdout
  assert '"other.py"' in run.stdout and '"unrelated"' in run.stdout
  assert any(g.get('kind')=='file' and g.get('decision')=='below-threshold' for g in groups(run.stdout))
  assert any(g.get('kind')=='directory' and g.get('decision')=='pruned-descendants-unchecked' for g in groups(run.stdout))
  assert record['outputBytes']==len(run.stdout.encode()) and len(full.encode())>record['outputBytes']
  print('PASS: useful context and file/folder negatives stay inline; full rejected-excerpt evidence remains accessible')
finally:server.shutdown();server.server_close();thread.join()
