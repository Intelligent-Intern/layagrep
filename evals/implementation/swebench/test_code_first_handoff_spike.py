"""CLI regression: documentation must not hide selected executable code from head200."""
import http.server,json,pathlib,subprocess,tempfile,threading,os
ROOT=pathlib.Path(__file__).resolve().parents[3]
source=ROOT/os.environ.get('JEV_SPIKE_SOURCE','evals/implementation/swebench/hierarchy-code-first-v27-spike.ts')
class Gateway(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  request=json.loads(self.rfile.read(int(self.headers['content-length'])));body=json.dumps({'answers':{key:{'type':'boolean','probability':.9} for key in request['questions']},'usage':{'inputTokens':20,'outputTokens':2}}).encode()
  self.send_response(200);self.send_header('content-type','application/json');self.send_header('content-length',str(len(body)));self.end_headers();self.wfile.write(body)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Gateway);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-code-layout-') as d:
  p=pathlib.Path(d);repo=p/'repo';repo.mkdir()
  text='class Store:\n    """IMPORTANT_CLASS_CONTRACT\n'+'    Context remains available.\n'*120+'    """\n    def answer(self):\n        """IMPORTANT_METHOD_CONTRACT\n'+'        Context remains available.\n'*120+'        """\n        return "CODE_RESULT"\n'
  (repo/'store.py').write_text(text);bundle=p/'spike.mjs';subprocess.run(['bun','build',str(source),'--target=node','--outfile='+str(bundle)],check=True,capture_output=True)
  metrics=p/'result.json';env=dict(os.environ,AI_GATEWAY_API_KEY='synthetic-only',AI_GATEWAY_BASE_URL=f'http://127.0.0.1:{server.server_port}')
  r=subprocess.run(['node',str(bundle),'--root',str(repo),'--query','Find Store.answer behavior and constraints','--metrics',str(metrics),'--context','chunks'],env=env,capture_output=True,text=True,timeout=30);assert r.returncode==0,r.stderr
  head='\n'.join(r.stdout.splitlines()[:200]);assert 'return "CODE_RESULT"' in head,'Selected method body still hidden behind docstrings'
  full=pathlib.Path(str(metrics)+'.context.txt').read_text()
  assert 'IMPORTANT_CLASS_CONTRACT' in full and 'IMPORTANT_METHOD_CONTRACT' in full
  assert full.index('return "CODE_RESULT"')<full.index('IMPORTANT_CLASS_CONTRACT')
  print('PASS: actual CLI head200 exposes selected method body; both documentation contracts remain in the full report')
finally:server.shutdown();server.server_close();thread.join()
