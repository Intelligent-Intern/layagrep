"""Exercise recovery through the real CLI and SDK against a local HTTP service."""
import http.server,json,pathlib,subprocess,tempfile,threading,os,sys
ROOT=pathlib.Path(__file__).resolve().parents[3]
source=ROOT/os.environ.get('JEV_SPIKE_SOURCE','evals/implementation/swebench/hierarchy-resilient-spike.ts')
scenario=sys.argv[1] if len(sys.argv)>1 else 'transient'
class Gateway(http.server.BaseHTTPRequestHandler):
 attempts=0
 def log_message(self,*args):pass
 def do_POST(self):
  data=json.loads(self.rfile.read(int(self.headers['content-length'])))
  Gateway.attempts+=1
  if (scenario=='transient' and Gateway.attempts==1) or (scenario=='persistent' and any(i['path']=='feature000.py' for i in data['state']['items'])):
   status=503;value={'error':{'type':'service_unavailable_error','message':'Service temporarily unavailable.'}}
  else:
   status=200;value={'answers':{key:{'type':'boolean','probability':.1 if scenario=='budget' else .9} for key in data['questions']},'usage':{'inputTokens':20,'outputTokens':2}}
  body=json.dumps(value).encode();self.send_response(status);self.send_header('content-type','application/json');self.send_header('content-length',str(len(body)));self.end_headers();self.wfile.write(body)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Gateway)
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-recovery-') as d:
  p=pathlib.Path(d);bundle=p/'spike.mjs';repo=p/'repo';repo.mkdir();(repo/'feature.py').write_text('def telemetry():\n    return "RELEVANT_CONTEXT"\n')
  if scenario=='persistent':
   (repo/'feature.py').unlink()
   for i in range(129):(repo/f'feature{i:03}.py').write_text('def telemetry():\n    return "RELEVANT_CONTEXT"\n')
  if scenario=='budget':
   (repo/'feature.py').unlink()
   for i in range(3000):(repo/(f'{i:04}'+('x'*220)+'.py')).write_text('pass\n')
  subprocess.run(['bun','build',str(source),'--target=node','--outfile='+str(bundle)],check=True,capture_output=True)
  metrics=p/'result.json';env=dict(os.environ,AI_GATEWAY_API_KEY='synthetic-only',AI_GATEWAY_BASE_URL=f'http://127.0.0.1:{server.server_port}')
  run=subprocess.run(['node',str(bundle),'--root',str(repo),'--query','Find telemetry','--metrics',str(metrics),'--context','chunks'],env=env,capture_output=True,text=True,timeout=30)
  assert run.returncode==0,run.stderr
  record=json.loads(metrics.read_text())
  if scenario!='budget':assert 'RELEVANT_CONTEXT' in run.stdout, 'Failure lost independently recoverable source'
  if scenario=='transient':assert record['status']=='complete', 'Recovered failure incorrectly marked incomplete'
  elif scenario=='persistent':
   assert record['status']=='partial'
   assert any(d['path']=='feature000.py' and d['decision']=='unscored-after-interruption' for d in record['decisions']), 'Failed file must not become a negative'
   assert any(d['path']=='feature128.py' and d['decision']=='relevant' for d in record['decisions']), 'Independent batch lost'
   assert sum(bool(c.get('error')) for c in record['calls'])==2, 'Persistent error must stop after one retry'
  if scenario=='budget':
   assert record['httpRequests']<=40, 'Request limit exceeded'
   assert any(d['decision']=='unscored-after-interruption' for d in record['decisions']), 'Fixture did not exercise pending work'
   assert record['status']=='partial', 'Unvisited batches incorrectly reported complete'
  else:assert any(c.get('error') for c in record['calls']), 'Failure attempt was not retained'
  print('PASS:',scenario,'failure preserves useful context and accurate coverage')
finally:server.shutdown();server.server_close();thread.join()
