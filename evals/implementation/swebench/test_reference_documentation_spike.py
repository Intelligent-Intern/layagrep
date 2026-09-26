"""A navigation-negative dependency can become selected from caller-aware evidence."""
import http.server,json,pathlib,subprocess,tempfile,threading,os
ROOT=pathlib.Path(__file__).resolve().parents[3]
source=ROOT/os.environ.get('JEV_SPIKE_SOURCE','evals/implementation/swebench/hierarchy-code-first-v27-spike.ts')
class Gateway(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  request=json.loads(self.rfile.read(int(self.headers['content-length'])));answers={}
  for key,item in zip(request['questions'],request['state']['items']):
   probability=.9
   if item['kind']=='file' and item['path']=='adapter.py':probability=.2
   if item['kind']=='reference':
    probability=.8 if item['path']=='adapter.py' and any('Storage(value)' in c['text'] for c in item.get('callers',[])) else .1
   answers[key]={'type':'boolean','probability':probability}
  body=json.dumps({'answers':answers,'usage':{'inputTokens':20,'outputTokens':2}}).encode();self.send_response(200);self.send_header('content-type','application/json');self.send_header('content-length',str(len(body)));self.end_headers();self.wfile.write(body)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Gateway);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-reference-cli-') as d:
  p=pathlib.Path(d);repo=p/'repo';repo.mkdir()
  (repo/'caller.py').write_text('from adapter import Box as Storage, finish\ndef copy(value):\n    return finish(Storage(value))\n')
  (repo/'adapter.py').write_text('class Box:\n    """FIRST_CONTRACT"""\n    def __init__(self, value):\n        self.dtype = value.dtype\ndef finish(value):\n    """SECOND_CONTRACT\n'+'    documentation\n'*100+'    """\n    return value.dtype\n')
  bundle=p/'spike.mjs';subprocess.run(['bun','build',str(source),'--target=node','--outfile='+str(bundle)],check=True,capture_output=True)
  metrics=p/'result.json';env=dict(os.environ,AI_GATEWAY_API_KEY='synthetic-only',AI_GATEWAY_BASE_URL=f'http://127.0.0.1:{server.server_port}')
  run=subprocess.run(['node',str(bundle),'--root',str(repo),'--query','Where does copy preserve dtype?','--metrics',str(metrics),'--context','chunks'],env=env,capture_output=True,text=True,timeout=30);assert run.returncode==0,run.stderr
  assert 'self.dtype = value.dtype' in run.stdout,'Referenced implementation missing from the delivered context'
  report=json.loads(metrics.read_text())
  assert any(x['path']=='adapter.py' and x['kind']=='file' and x['decision']=='below-threshold' for x in report['decisions']),'Earlier navigation estimate must remain auditable'
  assert any(x['path']=='adapter.py' and x['kind']=='reference' and x['decision']=='relevant' for x in report['decisions'])
  assert 'Referenced declaration: "adapter.py" Box' in run.stdout.split('--- End summary')[0]
  assert run.stdout.index('self.dtype = value.dtype')<run.stdout.index('FIRST_CONTRACT'),'First reference docstring precedes its executable source'
  assert run.stdout.index('return value.dtype')<run.stdout.index('SECOND_CONTRACT'),'Second reference docstring precedes its executable source'
  print('PASS: CLI delivers the caller-supported dependency, surfaces it in summary, and preserves the earlier negative navigation estimate')
finally:server.shutdown();server.server_close();thread.join()
