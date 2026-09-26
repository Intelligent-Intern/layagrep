"""CONNECT-only model-origin allowlist; never log headers, paths, or payloads."""
import socket,socketserver,select,json,threading
LOG_LOCK=threading.Lock()
ALLOW={'chatgpt.com','api.openai.com','auth.openai.com','api.anthropic.com','console.anthropic.com','claude.ai','platform.claude.com'}
class Handler(socketserver.StreamRequestHandler):
 def handle(self):
  line=self.rfile.readline(8192).decode('ascii','replace').strip(); parts=line.split()
  while True:
   h=self.rfile.readline(8192)
   if h in (b'\r\n',b'\n',b''):break
  if len(parts)!=3 or parts[0]!='CONNECT':self.wfile.write(b'HTTP/1.1 403 Forbidden\r\n\r\n');return
  host,_,port=parts[1].rpartition(':');allowed=host.lower() in ALLOW and port=='443'
  with LOG_LOCK: print(json.dumps({'host':host,'port':port,'allowed':allowed}),flush=True)
  if not allowed:self.wfile.write(b'HTTP/1.1 403 Forbidden\r\n\r\n');return
  try:remote=socket.create_connection((host,443),timeout=20)
  except OSError:self.wfile.write(b'HTTP/1.1 502 Bad Gateway\r\n\r\n');return
  self.wfile.write(b'HTTP/1.1 200 Connection Established\r\n\r\n');self.wfile.flush()
  with remote:
   peers=[self.connection,remote]
   while True:
    ready,_,_=select.select(peers,[],[],120)
    if not ready:return
    for src in ready:
     data=src.recv(65536)
     if not data:return
     (remote if src is self.connection else self.connection).sendall(data)
class Server(socketserver.ThreadingTCPServer):
 allow_reuse_address=True
 daemon_threads=True
# Only this separate, non-agent container ever receives the real gateway key.
import http.server,urllib.request,urllib.error,pathlib,time,hmac
class Gateway(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  try:
   config=json.loads(pathlib.Path('/run/gateway.json').read_text())
   if self.path!='/evaluation-model' or self.headers.get('ai-model-id')!='typesafe-ai/jev' or not hmac.compare_digest(self.headers.get('Authorization',''),'Bearer '+config['token']):
    self.send_error(403);return
   size=int(self.headers.get('Content-Length','0'))
   if size<1 or size>2000000:self.send_error(413);return
   data=self.rfile.read(size);started=time.monotonic()
   request=urllib.request.Request('https://ai-gateway.vercel.sh/v4/ai/evaluation-model',data=data,headers={'Authorization':'Bearer '+config['key'],'Content-Type':'application/json','ai-model-id':'typesafe-ai/jev','ai-evaluation-model-specification-version':'4','ai-gateway-protocol-version':'0.0.1','ai-gateway-auth-method':'api-key'})
   try:
    with urllib.request.urlopen(request,timeout=90) as response:body=response.read();status=response.status
   except urllib.error.HTTPError as error:body=error.read();status=error.code
   with LOG_LOCK:print(json.dumps({'kind':'gateway','status':status,'requestBytes':len(data),'responseBytes':len(body),'elapsedSeconds':time.monotonic()-started}),flush=True)
   self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
  except (OSError,ValueError,KeyError):self.send_error(502)
threading.Thread(target=http.server.ThreadingHTTPServer(('0.0.0.0',3129),Gateway).serve_forever,daemon=True).start()
Server(('0.0.0.0',3128),Handler).serve_forever()
