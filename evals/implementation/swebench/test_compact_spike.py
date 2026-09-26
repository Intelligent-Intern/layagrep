"""Lossless coverage and unchanged source through the CLI's text output."""
import http.server,json,pathlib,subprocess,tempfile,threading,os,collections
ROOT=pathlib.Path(__file__).resolve().parents[3]
source=ROOT/os.environ.get('JEV_SPIKE_SOURCE','evals/implementation/swebench/hierarchy-compact-spike.ts')
class Gateway(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  x=json.loads(self.rfile.read(int(self.headers['content-length'])));items=x['state']['items']
  answers={k:{'type':'boolean','probability':.1 if (items[i]['path']=='noise' or 'REJECT' in items[i].get('text','')) else .9} for i,k in enumerate(x['questions'])}
  body=json.dumps({'answers':answers,'usage':{'inputTokens':20,'outputTokens':2}}).encode();self.send_response(200);self.send_header('content-type','application/json');self.send_header('content-length',str(len(body)));self.end_headers();self.wfile.write(body)
def decode(text):
 records=[];common=None;fields=None
 for line in text.splitlines():
  if line.startswith('group '):common=json.loads(line[6:])
  elif line.startswith('fields '):fields=json.loads(line[7:])
  elif line.startswith('['):records.append({**common,**{k:v for k,v in zip(fields,json.loads(line))}})
 return records
canonical=lambda rows:collections.Counter(json.dumps(r,sort_keys=True) for r in rows)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Gateway);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-compact-') as d:
  p=pathlib.Path(d);repo=p/'repo';repo.mkdir();(repo/'noise').mkdir();(repo/'noise/hidden.py').write_text('HIDDEN')
  (repo/'mixed.py').write_text('def wanted():\n    return "KEEP"\n\n'+''.join(f'def unrelated_{i}():\n    return "REJECT"\n\n' for i in range(30)))
  (repo/'odd"name.py').write_text('def extra():\n    return "OTHER"\n')
  bundle=p/'spike.mjs';subprocess.run(['bun','build',str(source),'--target=node','--outfile='+str(bundle)],check=True,capture_output=True)
  metrics=p/'result.json';env=dict(os.environ,AI_GATEWAY_API_KEY='synthetic-only',AI_GATEWAY_BASE_URL=f'http://127.0.0.1:{server.server_port}')
  run=subprocess.run(['node',str(bundle),'--root',str(repo),'--query','Find wanted behavior','--metrics',str(metrics),'--context','chunks','--max-source-bytes','100'],env=env,capture_output=True,text=True,timeout=30)
  assert run.returncode==0,run.stderr
  report=json.loads(metrics.read_text());assert run.stdout.startswith('Jevgrep summary: complete')
  assert 'return "KEEP"' in run.stdout and 'return "REJECT"' not in run.stdout
  assert '\nDiscovery decisions (grouped):\n' in run.stdout,'Coverage still repeats a full object per excerpt'
  decisions,tail=run.stdout.split('\nDiscovery decisions (grouped):\n')[1].split('\nRelevant context omissions (grouped):\n')
  omissions=tail.split('\nUnvisited directories:')[0]
  expected=[r for r in report['decisions'] if r['decision']!='excluded']
  assert canonical(decode(decisions))==canonical(expected),'Decision fields lost or changed'
  assert canonical(decode(omissions))==canonical(report['omissions']),'Omission fields lost or changed'
  assert report['omissions'],'Fixture must exercise an omitted relevant excerpt'
  assert len(decisions.encode())<len('\n'.join(json.dumps(r,separators=(',',':')) for r in expected).encode()),'No coverage compression'
  assert pathlib.Path(str(metrics)+'.context.txt').read_text()==run.stdout
  print('PASS: all coverage fields round-trip, relevant source survives, unrelated source excluded, output is smaller')
finally:server.shutdown();server.server_close();thread.join()
