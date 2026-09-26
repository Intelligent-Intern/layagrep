"""Check that normal discovery continues beyond the former 40-request cap."""
import http.server,json,pathlib,subprocess,tempfile,threading,os
ROOT=pathlib.Path(__file__).resolve().parents[3]
source=ROOT/os.environ.get('JEV_SPIKE_SOURCE','evals/implementation/swebench/hierarchy-guard-spike.ts')
class Gateway(http.server.BaseHTTPRequestHandler):
 attempts=0
 def log_message(self,*args):pass
 def do_POST(self):
  data=json.loads(self.rfile.read(int(self.headers['content-length'])))
  Gateway.attempts+=1
  value={'answers':{key:{'type':'boolean','probability':.1} for key in data['questions']},'usage':{'inputTokens':20,'outputTokens':2}}
  body=json.dumps(value).encode();self.send_response(200);self.send_header('content-type','application/json');self.send_header('content-length',str(len(body)));self.end_headers();self.wfile.write(body)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Gateway)
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-recovery-') as d:
  p=pathlib.Path(d);bundle=p/'spike.mjs';repo=p/'repo';repo.mkdir()
  for i in range(3000):(repo/(f'{i:04}'+('x'*220)+'.py')).write_text('pass\n')
  subprocess.run(['bun','build',str(source),'--target=node','--outfile='+str(bundle)],check=True,capture_output=True)
  metrics=p/'result.json';env=dict(os.environ,AI_GATEWAY_API_KEY='synthetic-only',AI_GATEWAY_BASE_URL=f'http://127.0.0.1:{server.server_port}')
  run=subprocess.run(['node',str(bundle),'--root',str(repo),'--query','Find telemetry','--metrics',str(metrics),'--context','chunks'],env=env,capture_output=True,text=True,timeout=30)
  assert run.returncode==0,run.stderr
  record=json.loads(metrics.read_text())
  assert record['httpRequests']>40,'Fixture did not exercise work beyond former cap'
  assert record['status']=='complete','Old count limit interrupted work'
  checked={d['path'] for d in record['decisions'] if d['kind']=='file' and d['decision']=='below-threshold'}
  assert checked=={p.name for p in repo.iterdir()},'A file was lost or falsely claimed checked'
  assert not any(d['decision']=='unscored-after-interruption' for d in record['decisions'])
  print('PASS: all 3000 files checked across more than 40 requests')
finally:server.shutdown();server.server_close();thread.join()
