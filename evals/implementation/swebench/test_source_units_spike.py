"""Offline protocol smoke; synthetic filesystem, real AI SDK transport, no model calls."""
import http.server,json,pathlib,subprocess,tempfile,threading,os,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[3]
bundle=ROOT/'evals/runs/tooling/swebench/hierarchy-units-spike.mjs'
subprocess.run(['bun','build',str(ROOT/'evals/implementation/swebench/hierarchy-units-spike.ts'),'--target=node','--outfile='+str(bundle)],check=True,capture_output=True)
seen=[]
class Gateway(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args): pass
 def do_POST(self):
  assert self.path=='/evaluation-model'
  assert self.headers['ai-model-id']=='typesafe-ai/jev'
  data=json.loads(self.rfile.read(int(self.headers['content-length'])));items=data['state']['items'];seen.append(items)
  assert not any(i['path'].startswith('unrelated/') for i in items),items
  answers={key:{'type':'boolean','probability':.1 if (items[i]['path']=='unrelated' or (items[i]['kind']=='chunk' and 'REJECT_CHUNK' in items[i].get('text',''))) else .9} for i,key in enumerate(data['questions'])}
  for i,key in enumerate(data['questions']):
   if 'CLASS_TARGET' in items[i].get('text',''):
    answers[key]['probability']=.9 if any('TelemetryStore' in c['text'] for c in items[i].get('contexts',[])) else .1
  body=json.dumps({'answers':answers,'usage':{'inputTokens':20,'outputTokens':2}}).encode();self.send_response(200);self.send_header('content-type','application/json');self.send_header('content-length',str(len(body)));self.end_headers();self.wfile.write(body)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Gateway);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
rows=[]
try:
 with tempfile.TemporaryDirectory(prefix='jev-hierarchy-offline-') as d:
  p=pathlib.Path(d);repo=p/'repo';(repo/'feature').mkdir(parents=True);(repo/'unrelated/deep').mkdir(parents=True)
  for name in ['a','b','c']:(repo/f'feature/{name}.py').write_text(f"def {name}():\n    return 'BODY_{name}'\n")
  (repo/'unrelated/deep/noise.py').write_text("def noise():\n    return 'MUST_NOT_READ'\n")
  (repo/'feature/irrelevant.py').write_text('REJECT_CHUNK = 1\n')
  (repo/'feature/mixed.py').write_text('def wanted():\n    return \"KEEP_UNIT\"\n\ndef unrelated():\n    return \"REJECT_CHUNK\"\n')
  (repo/'feature/classes.py').write_text('@instrumented\nclass TelemetryStore(BaseStore):\n    \"\"\"Persists telemetry.\"\"\"\n    def save(self):\n        return \"CLASS_TARGET\"\n')
  (repo/'.env').write_text('PRIVATE_SENTINEL=synthetic\n')
  (repo/'escape.py').symlink_to('/etc/hosts')
  for mode in ['files','chunks']:
   seen.clear();metrics=p/f'{mode}.json';env=dict(os.environ,AI_GATEWAY_API_KEY='synthetic-only',AI_GATEWAY_BASE_URL=f'http://127.0.0.1:{server.server_port}')
   result=subprocess.run(['node',str(bundle),'--root',str(repo),'--query','Find the behavior','--metrics',str(metrics),'--context',mode],env=env,capture_output=True,text=True,timeout=30)
   assert result.returncode==0,(result.stderr,result.stdout)
   record=json.loads(metrics.read_text());assert record['status']=='complete',record
   for name in ['a','b','c']:assert f'BODY_{name}' in result.stdout
   assert 'MUST_NOT_READ' not in result.stdout and 'PRIVATE_SENTINEL' not in result.stdout
   assert any(x['path']=='unrelated' and x['decision']=='pruned-descendants-unchecked' for x in record['decisions'])
   assert not any(x['path'].startswith('unrelated/') for x in record['decisions'])
   assert pathlib.Path(str(metrics)+'.context.txt').read_text()==result.stdout
   assert record['outputBytes']==len(result.stdout.encode())
   head='\n'.join(result.stdout.splitlines()[:40])
   assert head.startswith('Jevgrep summary: complete')
   assert 'Checked negatives: 1 folders' in head and 'unrelated' in head
   assert 'Full report (all context and decisions):' in head
   for name in ['a','b','c']:assert f'feature/{name}.py' in head
   if mode=='chunks':
    assert 'CLASS_TARGET' in result.stdout
    assert 'Enclosing context \"feature/classes.py\" lines 1-3' in result.stdout
    assert '@instrumented\nclass TelemetryStore(BaseStore):\n    \"\"\"Persists telemetry.\"\"\"' in result.stdout
    assert 'KEEP_UNIT' in result.stdout
    assert 'return \"REJECT_CHUNK\"' not in result.stdout
    mixed=[x for x in record['decisions'] if x['path']=='feature/mixed.py' and x['kind']=='chunk']
    assert any(x['decision']=='relevant' and x['startLine']==1 and x['endLine']==2 for x in mixed)
    assert any(x['decision']=='below-threshold' and x['startLine']==4 and x['endLine']==5 for x in mixed)
    negative=[x for x in record['decisions'] if x['path']=='feature/irrelevant.py' and x['kind']=='chunk']
    assert len(negative)==1 and negative[0]['decision']=='below-threshold' and negative[0]['startLine']==1
    assert json.dumps(negative[0],separators=(',',':')) in result.stdout
    assert 'REJECT_CHUNK = 1' not in result.stdout
   assert any(i.get('text') for call in seen for i in call)==(mode=='chunks')
   rows.append({'context':mode,'noGitRequired':not(repo/'.git').exists(),'rejectedSubtreeNotEnumerated':True,'allThreeRelevantFilesReturned':True,'privateAndSymlinkContentExcluded':True,'sidecarExact':True,'mockRequests':len(seen),'paidCalls':0})
 print(json.dumps({'bundleSha256':hashlib.sha256(bundle.read_bytes()).hexdigest(),'results':rows},indent=2))
finally:server.shutdown();server.server_close()
