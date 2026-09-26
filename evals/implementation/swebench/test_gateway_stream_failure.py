"""An incomplete upstream SSE response must never look like normal completion."""
import http.server,http.client,threading,tempfile,pathlib,json,importlib.util
HERE=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('proxy',HERE/'agent-runtime/gateway_stream_proxy.py')
proxy=importlib.util.module_from_spec(spec);spec.loader.exec_module(proxy)
class Upstream(http.server.BaseHTTPRequestHandler):
 protocol_version='HTTP/1.1'
 def log_message(self,*args):pass
 def do_POST(self):
  request=json.loads(self.rfile.read(int(self.headers['content-length'])))
  self.send_response(200);self.send_header('Content-Type','text/event-stream');self.send_header('Transfer-Encoding','chunked');self.send_header('Connection','close');self.end_headers()
  data=b'event: message_start\ndata: {"type":"message_start"}\n\nevent: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Now the edits:"}}\n\n'
  if request['case'].startswith('complete_'):
   data+=b'event: message_stop\ndata: {"type":"message_stop"}\n\n'
   separator={'complete_lf':b'\n','complete_cr':b'\r','complete_crlf':b'\r\n'}[request['case']]
   data=data.replace(b'\n',separator)
   # One-byte HTTP chunks exercise separators split across reads.
   for byte in data:self.wfile.write(b'1\r\n'+bytes([byte])+b'\r\n');self.wfile.flush()
  else:self.wfile.write(('%x\r\n'%len(data)).encode()+data+b'\r\n');self.wfile.flush()
  if request['case']!='broken_chunked_stream':self.wfile.write(b'0\r\n\r\n');self.wfile.flush()
  self.close_connection=True
servers=[http.server.ThreadingHTTPServer(('127.0.0.1',0),Upstream),http.server.ThreadingHTTPServer(('127.0.0.1',0),proxy.Gateway)]
threads=[threading.Thread(target=s.serve_forever,daemon=True) for s in servers]
for t in threads:t.start()
try:
 with tempfile.TemporaryDirectory(prefix='jev-stream-test-') as d:
  config=pathlib.Path(d)/'config.json';config.write_text(json.dumps({'key':'synthetic-real-key','token':'synthetic-token'}));proxy.CONFIG_PATH=str(config);proxy.GATEWAY_ORIGIN=f'http://127.0.0.1:{servers[0].server_port}'
  for case in ['broken_chunked_stream','clean_eof_without_stop','complete_cr','complete_crlf','complete_lf']:
   c=http.client.HTTPConnection('127.0.0.1',servers[1].server_port,timeout=3)
   c.request('POST','/claude-code/v1/messages?beta=true',body=json.dumps({'model':'anthropic/claude-opus-5','stream':True,'case':case}),headers={'Authorization':'Bearer synthetic-token','Content-Type':'application/json'})
   r=c.getresponse();data=r.read().decode();c.close()
   assert r.status==200 and 'Now the edits:' in data
   events=[json.loads(line[6:]) for line in data.splitlines() if line.startswith('data: ')]
   if case.startswith('complete_'):
    assert events[-1].get('type')=='message_stop' and not any(e.get('type')=='error' for e in events),(case,'Valid completion rejected')
    print('PASS:',case,'preserves successful completion');continue
   assert events[-1].get('type')=='error',(case,'Stream silently ended without an error event')
   assert events[-1]['error']['type']=='api_error'
   assert 'synthetic-real-key' not in data
   print('PASS:',case,'is explicit stream error')
finally:
 for s in servers:s.shutdown();s.server_close()
 for t in threads:t.join()
