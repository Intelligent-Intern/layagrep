"""Isolated Claude/JeV gateway broker; never log headers, paths, or payloads."""
import socket,socketserver,select,json,threading,os,uuid,re
LOG_LOCK=threading.Lock()
ALLOW=set()  # All model traffic uses the authenticated local broker.
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
import http.server,http.client,urllib.request,urllib.error,urllib.parse,pathlib,time,hmac
CONFIG_PATH=os.environ.get('JEVGREP_GATEWAY_CONFIG','/run/gateway.json')
GATEWAY_ORIGIN='https://ai-gateway.vercel.sh'
def generation_id(value):
 if not isinstance(value,dict):return None
 value=value.get('id')
 return value if isinstance(value,str) and len(value)<=128 and re.fullmatch(r'gen_[A-Za-z0-9]+',value) else None
class StreamCompletion:
 def __init__(self):self.pending=bytearray();self.data=[];self.terminal=None;self.after_cr=False;self.generation_id=None
 def feed(self,chunk):
  for byte in chunk:
   if self.after_cr and byte==10:self.after_cr=False;continue
   self.after_cr=byte==13
   if byte not in (10,13):self.pending.append(byte);continue
   line=bytes(self.pending);self.pending.clear()
   if line.startswith(b'data:'):self.data.append(line[5:].lstrip())
   elif not line:
    try:
     event=json.loads(b'\n'.join(self.data))
     if isinstance(event,dict):
      if event.get('type') in ('message_stop','error'):self.terminal=event['type']
      if event.get('type')=='message_start':self.generation_id=generation_id(event.get('message'))
    except ValueError:pass
    self.data=[]
class Gateway(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  started=time.monotonic();sent=False;request_id=uuid.uuid4().hex
  try:
   config=json.loads(pathlib.Path(CONFIG_PATH).read_text())
   if not hmac.compare_digest(self.headers.get('Authorization',''),'Bearer '+config['token']):
    self.send_error(403);return
   route=urllib.parse.urlsplit(self.path)
   claude=not route.scheme and not route.netloc and route.path in ('/claude-code/v1/messages','/claude-code/v1/messages/count_tokens')
   jev=self.path=='/evaluation-model' and self.headers.get('ai-model-id')=='typesafe-ai/jev'
   if not (claude or jev):self.send_error(403);return
   size=int(self.headers.get('Content-Length','0'))
   if size<1 or size>2000000:self.send_error(413);return
   data=self.rfile.read(size)
   headers={'Authorization':'Bearer '+config['key'],'Content-Type':'application/json'}
   if claude:
    body=json.loads(data)
    if not isinstance(body,dict) or body.get('model') not in ('anthropic/claude-opus-5','claude-opus-5'):
     self.send_error(403);return
    for header in ('anthropic-version','anthropic-beta'):
     if self.headers.get(header):headers[header]=self.headers[header]
    target=GATEWAY_ORIGIN+self.path
   else:
    target=GATEWAY_ORIGIN+'/v4/ai/evaluation-model'
    headers.update({'ai-model-id':'typesafe-ai/jev','ai-evaluation-model-specification-version':'4','ai-gateway-protocol-version':'0.0.1','ai-gateway-auth-method':'api-key'})
   with LOG_LOCK:print(json.dumps({'kind':'claude-request-start' if claude else 'jev-request-start','requestId':request_id,'startedAt':time.time(),'operation':'count_tokens' if route.path.endswith('/count_tokens') else 'generation','streamed':bool(body.get('stream')) if claude else False}),flush=True)
   request=urllib.request.Request(target,data=data,headers=headers)
   try:response=urllib.request.urlopen(request,timeout=90)
   except urllib.error.HTTPError as error:response=error
   with response:
    status=response.status;self.send_response(status)
    self.send_header('Content-Type',response.headers.get('Content-Type','application/json'))
    self.send_header('Connection','close');self.end_headers();sent=True;response_bytes=0
    streaming=claude and body.get('stream') is True and 'text/event-stream' in response.headers.get('Content-Type','')
    completion=StreamCompletion();transport_error=None;observed_generation=None;metadata_body=bytearray();metadata_oversized=False
    try:
     while True:
      chunk=response.read1(16384)
      if not chunk:break
      if streaming:
       completion.feed(chunk)
       if completion.generation_id and completion.generation_id!=observed_generation:
        observed_generation=completion.generation_id
        with LOG_LOCK:print(json.dumps({'kind':'claude-generation','requestId':request_id,'generationId':observed_generation,'receivedAt':time.time()}),flush=True)
      elif claude and route.path=='/claude-code/v1/messages' and not metadata_oversized:
       if len(metadata_body)+len(chunk)<=2000000:metadata_body.extend(chunk)
       else:metadata_body.clear();metadata_oversized=True
      self.wfile.write(chunk);self.wfile.flush();response_bytes+=len(chunk)
    except (OSError,http.client.HTTPException) as error:transport_error=type(error).__name__
    if claude and not streaming and metadata_body:
     try:observed_generation=generation_id(json.loads(metadata_body))
     except ValueError:pass
     if observed_generation:
      with LOG_LOCK:print(json.dumps({'kind':'claude-generation','requestId':request_id,'generationId':observed_generation,'receivedAt':time.time()}),flush=True)
    incomplete=streaming and completion.terminal is None
    if incomplete:
     # Close any partial SSE event before sending a client-visible failure.
     failure=b'\n\nevent: error\ndata: {"type":"error","error":{"type":"api_error","message":"Upstream response interrupted before completion"}}\n\n'
     try:self.wfile.write(failure);self.wfile.flush()
     except OSError:pass
   with LOG_LOCK:print(json.dumps({'kind':'claude-gateway' if claude else 'gateway','requestId':request_id,'generationId':observed_generation,'status':status,'requestBytes':len(data),'responseBytes':response_bytes,'streamTerminal':completion.terminal if streaming else None,'incompleteStream':incomplete,'transportError':transport_error,'elapsedSeconds':time.monotonic()-started}),flush=True)
  except (OSError,ValueError,KeyError,http.client.HTTPException) as error:
   with LOG_LOCK:print(json.dumps({'kind':'broker-error','requestId':request_id,'headersSent':sent,'error':type(error).__name__,'elapsedSeconds':time.monotonic()-started}),flush=True)
   if not sent:
    try:self.send_error(502)
    except OSError:pass
  finally:self.close_connection=True
if __name__=='__main__':
 threading.Thread(target=http.server.ThreadingHTTPServer(('0.0.0.0',3129),Gateway).serve_forever,daemon=True).start()
 Server(('0.0.0.0',3128),Handler).serve_forever()
