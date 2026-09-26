"""Native Responses routing with early accounting, without exposing credentials/content."""
import http.server,http.client,threading,tempfile,pathlib,json,importlib.util,time
HERE=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('broker',HERE/'agent-runtime/gateway_responses_proxy.py');proxy=importlib.util.module_from_spec(spec);spec.loader.exec_module(proxy)
logs=[];proxy.print=lambda value,**kwargs:logs.append(json.loads(value));release=threading.Event();sent=threading.Event();done=[];upstream=[]
class Upstream(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  body=json.loads(self.rfile.read(int(self.headers['content-length'])));upstream.append((self.path,self.headers.get('Authorization'),body))
  self.send_response(200);self.send_header('Content-Type','text/event-stream');self.end_headers()
  self.wfile.write(b'data: {"type":"response.created","response":{"id":"gen_SOLTEST123"}}\n\ndata: {"type":"response.output_text.delta","delta":"PRIVATE_RESPONSE_TEXT"}\n\n');self.wfile.flush();sent.set();release.wait(4)
  self.wfile.write(b'data: {"type":"response.completed","response":{"id":"gen_SOLTEST123"}}\n\n');self.wfile.flush();self.close_connection=True
servers=[http.server.ThreadingHTTPServer(('127.0.0.1',0),Upstream),http.server.ThreadingHTTPServer(('127.0.0.1',0),proxy.Gateway)];threads=[threading.Thread(target=s.serve_forever,daemon=True) for s in servers]
for t in threads:t.start()
client=None
try:
 with tempfile.TemporaryDirectory(prefix='jev-sol-proxy-') as d:
  config=pathlib.Path(d)/'config.json';config.write_text(json.dumps({'key':'synthetic-real-key','token':'synthetic-token','agent_engine':'codex'}));proxy.CONFIG_PATH=str(config);proxy.GATEWAY_ORIGIN=f'http://127.0.0.1:{servers[0].server_port}'
  body={'model':'openai/gpt-5.6-sol','stream':True,'input':'PRIVATE_PROMPT_TEXT'}
  def request():
   c=http.client.HTTPConnection('127.0.0.1',servers[1].server_port,timeout=6)
   try:
    c.request('POST','/codex/v1/responses',body=json.dumps(body),headers={'Authorization':'Bearer synthetic-token','Content-Type':'application/json'});r=c.getresponse();done.append((r.status,r.read().decode()))
   finally:c.close()
  client=threading.Thread(target=request);client.start();assert sent.wait(2),'Sol request never reached upstream'
  deadline=time.monotonic()+1
  while time.monotonic()<deadline and not any(r.get('kind')=='codex-generation' for r in logs):time.sleep(.01)
  assert any(r.get('kind')=='codex-generation' and r.get('generationId')=='gen_SOLTEST123' for r in logs),'Missing early generation identity'
  assert not done,'Response completed before early accounting check'
  release.set();client.join(3);assert not client.is_alive() and done[0][0]==200 and 'response.completed' in done[0][1]
  assert upstream==[('/v1/responses','Bearer synthetic-real-key',body)]
  end=next(r for r in logs if r.get('kind')=='codex-gateway');assert end['streamTerminal']=='response.completed' and not end['incompleteStream']
  assert not any(secret in json.dumps(logs) for secret in ['PRIVATE_PROMPT_TEXT','PRIVATE_RESPONSE_TEXT','synthetic-real-key','synthetic-token'])
  c=http.client.HTTPConnection('127.0.0.1',servers[1].server_port,timeout=3)
  try:
   c.request('POST','/evaluation-model',body='{}',headers={'Authorization':'Bearer synthetic-token','ai-model-id':'typesafe-ai/jev','Content-Type':'application/json'});response=c.getresponse();response.read();assert response.status==403,'Baseline token can access Jev'
  finally:c.close()
  for route,token,model in [('/claude-code/v1/messages','synthetic-token','anthropic/claude-opus-5'),('/codex/v1/responses','wrong-token','openai/gpt-5.6-sol'),('/codex/v1/responses','synthetic-token','openai/gpt-5.6-luna'),('/codex/v1/chat/completions','synthetic-token','openai/gpt-5.6-sol')]:
   c=http.client.HTTPConnection('127.0.0.1',servers[1].server_port,timeout=3)
   try:
    c.request('POST',route,body=json.dumps(dict(body,model=model)),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'});response=c.getresponse();response.read();assert response.status==403,(route,model,response.status)
   finally:c.close()
  assert len(upstream)==1,'Rejected request reached upstream'
  config.write_text(json.dumps({'key':'synthetic-real-key','token':'synthetic-token','agent_engine':'codex','allow_jev':True}))
  c=http.client.HTTPConnection('127.0.0.1',servers[1].server_port,timeout=3)
  try:
   c.request('POST','/evaluation-model',body='{}',headers={'Authorization':'Bearer synthetic-token','ai-model-id':'typesafe-ai/jev','Content-Type':'application/json'});response=c.getresponse();response.read();assert response.status==200,'Treatment Jev route denied'
  finally:c.close()
  assert upstream[-1][0]=='/v4/ai/evaluation-model'
  print('PASS: Sol route and body preserved, broker credential substituted, generation logged before completion, content and credentials absent from logs')
finally:
 release.set()
 if client:client.join(6)
 for s in servers:s.shutdown();s.server_close()
 for t in threads:t.join()
