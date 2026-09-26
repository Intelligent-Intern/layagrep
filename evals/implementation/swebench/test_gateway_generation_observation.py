"""Generation identity survives before the terminal stream/native result exists."""
import http.server,http.client,threading,tempfile,pathlib,json,importlib.util,os,time
HERE=pathlib.Path(__file__).resolve().parent
source=HERE/os.environ.get('JEV_PROXY_SOURCE','agent-runtime/gateway_observed_proxy.py')
spec=importlib.util.spec_from_file_location('observed_proxy',source);proxy=importlib.util.module_from_spec(spec);spec.loader.exec_module(proxy)
logs=[];proxy.print=lambda value,**kwargs:logs.append(json.loads(value));release=threading.Event();sent=threading.Event();done=[]
class Upstream(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  self.rfile.read(int(self.headers['content-length']));self.send_response(200);self.send_header('Content-Type','text/event-stream');self.end_headers()
  self.wfile.write(b'data: {"type":"message_start","message":{"id":"gen_TEST123","usage":{"input_tokens":12}}}\n\ndata: {"type":"content_block_delta","delta":{"text":"PRIVATE_RESPONSE_TEXT"}}\n\n');self.wfile.flush();sent.set();release.wait(3)
  self.wfile.write(b'data: {"type":"message_stop"}\n\n');self.wfile.flush();self.close_connection=True
servers=[http.server.ThreadingHTTPServer(('127.0.0.1',0),Upstream),http.server.ThreadingHTTPServer(('127.0.0.1',0),proxy.Gateway)];threads=[threading.Thread(target=s.serve_forever,daemon=True) for s in servers]
for t in threads:t.start()
client=None
try:
 with tempfile.TemporaryDirectory(prefix='jev-observe-') as d:
  config=pathlib.Path(d)/'config.json';config.write_text(json.dumps({'key':'synthetic-real-key','token':'synthetic-token'}));proxy.CONFIG_PATH=str(config);proxy.GATEWAY_ORIGIN=f'http://127.0.0.1:{servers[0].server_port}'
  def request():
   c=http.client.HTTPConnection('127.0.0.1',servers[1].server_port,timeout=5)
   try:
    c.request('POST','/claude-code/v1/messages',body=json.dumps({'model':'anthropic/claude-opus-5','stream':True,'messages':[{'role':'user','content':'PRIVATE_PROMPT_TEXT'}]}),headers={'Authorization':'Bearer synthetic-token','Content-Type':'application/json'})
    r=c.getresponse();done.append((r.status,r.read().decode()))
   finally:c.close()
  client=threading.Thread(target=request);client.start();assert sent.wait(2)
  deadline=time.monotonic()+1
  while time.monotonic()<deadline and not any(r.get('kind')=='claude-generation' for r in logs):time.sleep(.01)
  assert any(r.get('kind')=='claude-generation' and r.get('generationId')=='gen_TEST123' for r in logs),'Generation ID unavailable until stream completion'
  assert not done,'Response completed before the early-identity check'
  release.set();client.join(3);assert not client.is_alive() and done[0][0]==200 and 'message_stop' in done[0][1]
  start=next(r for r in logs if r.get('kind')=='claude-request-start');generation=next(r for r in logs if r.get('kind')=='claude-generation');end=next(r for r in logs if r.get('kind')=='claude-gateway')
  assert start['requestId']==generation['requestId']==end['requestId']
  assert not any(secret in json.dumps(logs) for secret in ['PRIVATE_PROMPT_TEXT','PRIVATE_RESPONSE_TEXT','synthetic-real-key','synthetic-token'])
  print('PASS: request and generation IDs persist before completion without logging content or credentials')
finally:
 release.set()
 if client:client.join(5)
 for s in servers:s.shutdown();s.server_close()
 for t in threads:t.join()
