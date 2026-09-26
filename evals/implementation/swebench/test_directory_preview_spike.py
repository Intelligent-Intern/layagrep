"""CLI routing can use child names without uploading unselected source bodies."""
import http.server,json,pathlib,subprocess,tempfile,threading,os
ROOT=pathlib.Path(__file__).resolve().parents[3]
source=ROOT/os.environ.get('JEV_SPIKE_SOURCE','evals/implementation/swebench/hierarchy-preview-spike.ts')
class Gateway(http.server.BaseHTTPRequestHandler):
 payloads=[]
 def log_message(self,*args):pass
 def do_POST(self):
  data=json.loads(self.rfile.read(int(self.headers['content-length'])));Gateway.payloads.append(data)
  def probability(item):
   if item['kind']=='directory':return .95 if any(x['name']=='audit.py' for x in item.get('childPreview',{}).get('entries',[])) else .1
   return .95 if item['path'].endswith('audit.py') else .1
  body=json.dumps({'answers':{k:{'type':'boolean','probability':probability(data['state']['items'][i])} for i,k in enumerate(data['questions'])},'usage':{'inputTokens':20,'outputTokens':2}}).encode()
  self.send_response(200);self.send_header('content-type','application/json');self.send_header('content-length',str(len(body)));self.end_headers();self.wfile.write(body)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Gateway);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-preview-') as d:
  p=pathlib.Path(d);repo=p/'repo';(repo/'storage').mkdir(parents=True);(repo/'unrelated'/'nested').mkdir(parents=True)
  (repo/'many').mkdir()
  for i in range(100):(repo/'many'/f'entry_{i:03}.py').write_text('BULK_SOURCE_MUST_NOT_UPLOAD = True\n')
  (repo/'storage'/'audit.py').write_text('def emit_event():\n    return "USEFUL_TELEMETRY_SOURCE"\n')
  (repo/'unrelated'/'nested'/'private.py').write_text('UNSELECTED_SOURCE_MUST_NOT_UPLOAD = True\n')
  bundle=p/'spike.mjs';subprocess.run(['bun','build',str(source),'--target=node','--outfile='+str(bundle)],check=True,capture_output=True)
  env=dict(os.environ,AI_GATEWAY_API_KEY='synthetic-only',AI_GATEWAY_BASE_URL=f'http://127.0.0.1:{server.server_port}')
  run=subprocess.run(['node',str(bundle),'--root',str(repo),'--query','Find telemetry emission','--metrics',str(p/'metrics.json'),'--context','chunks'],env=env,capture_output=True,text=True,timeout=30)
  assert run.returncode==0,run.stderr
  assert 'USEFUL_TELEMETRY_SOURCE' in run.stdout,'Directory child evidence did not make useful source discoverable'
  assert 'UNSELECTED_SOURCE_MUST_NOT_UPLOAD' not in json.dumps(Gateway.payloads),'Unselected subtree source uploaded'
  record=json.loads((p/'metrics.json').read_text());assert any(x['path']=='unrelated' and x['decision']=='pruned-descendants-unchecked' for x in record['decisions'])
  assert not any(x['path'].startswith('unrelated/nested/') for x in record['decisions']),'Pruned subtree recursively inventoried'
  many=next(item for request in Gateway.payloads for item in request['state']['items'] if item['path']=='many')
  preview=many['childPreview']
  assert preview['truncated'] is True, 'Incomplete directory sample claimed to be complete'
  assert 0<len(preview['entries'])<100, 'Directory preview was not bounded'
  assert all(e['name'].startswith('entry_') and e['kind']=='file' for e in preview['entries'])
  assert 'BULK_SOURCE_MUST_NOT_UPLOAD' not in json.dumps(Gateway.payloads)
  print('PASS: child-name routing, lazy pruning, bounded previews and truthful truncation')
finally:server.shutdown();server.server_close();thread.join()
