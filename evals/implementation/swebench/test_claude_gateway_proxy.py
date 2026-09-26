"""Real local HTTP boundaries; never contact a provider or use real credentials."""
import http.server,http.client,threading,tempfile,pathlib,json,importlib.util,time
HERE=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('proxy',HERE/'agent-runtime/gateway_model_proxy.py');proxy=importlib.util.module_from_spec(spec);spec.loader.exec_module(proxy)
received=[];release=threading.Event()
class Upstream(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  body=self.rfile.read(int(self.headers['content-length']));received.append((self.path,self.headers.get('Authorization'),json.loads(body)))
  self.send_response(200);self.send_header('Content-Type','text/event-stream');self.end_headers()
  self.wfile.write(b'event: message_start\ndata: {"type":"message_start"}\n\n');self.wfile.flush()
  release.wait(5)
  self.wfile.write(b'event: message_stop\ndata: {"type":"message_stop"}\n\n');self.wfile.flush()
servers=[http.server.ThreadingHTTPServer(('127.0.0.1',0),Upstream),http.server.ThreadingHTTPServer(('127.0.0.1',0),proxy.Gateway)]
threads=[threading.Thread(target=s.serve_forever,daemon=True) for s in servers]
for t in threads:t.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-gateway-test-') as d:
  config=pathlib.Path(d)/'config.json';config.write_text(json.dumps({'key':'synthetic-real-key','token':'synthetic-scoped-token'}));proxy.CONFIG_PATH=str(config);proxy.GATEWAY_ORIGIN=f'http://127.0.0.1:{servers[0].server_port}'
  for route,token,model in [('/claude-code/v1/messages','wrong','anthropic/claude-opus-5'),('/other','synthetic-scoped-token','anthropic/claude-opus-5'),('/claude-code/v1/messages','synthetic-scoped-token','different-model')]:
   denied=http.client.HTTPConnection('127.0.0.1',servers[1].server_port,timeout=2)
   denied.request('POST',route,body=json.dumps({'model':model}),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
   response=denied.getresponse();assert response.status==403,(route,token,model,response.status);response.read();denied.close()
  assert not received,'Rejected request reached upstream'
  c=http.client.HTTPConnection('127.0.0.1',servers[1].server_port,timeout=2)
  data=json.dumps({'model':'anthropic/claude-opus-5','stream':True,'messages':[{'role':'user','content':'READY'}]})
  c.request('POST','/claude-code/v1/messages?beta=true',body=data,headers={'Authorization':'Bearer synthetic-scoped-token','Content-Type':'application/json'})
  r=c.getresponse();assert r.status==200,('Claude gateway route rejected',r.status)
  assert r.readline()==b'event: message_start\n','Initial SSE event not forwarded before completion'
  assert not release.is_set();release.set();rest=r.read();assert b'message_stop' in rest;c.close()
  assert received==[('/claude-code/v1/messages?beta=true','Bearer synthetic-real-key',json.loads(data))]
  for route in ['/claude-code/v1/messages','/claude-code/v1/messages/count_tokens?beta=true']:
   c=http.client.HTTPConnection('127.0.0.1',servers[1].server_port,timeout=2)
   c.request('POST',route,body=data,headers={'Authorization':'Bearer synthetic-scoped-token','Content-Type':'application/json'})
   r=c.getresponse();assert r.status==200,(route,r.status);r.read();c.close()
   assert received[-1]==(route,'Bearer synthetic-real-key',json.loads(data))
  print('PASS: scoped token swapped only upstream; streamed event delivered before completion')
finally:
 release.set()
 for s in servers:s.shutdown();s.server_close()
 for t in threads:t.join()
