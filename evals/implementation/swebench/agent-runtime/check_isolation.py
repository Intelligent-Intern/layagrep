"""Offline container checks: no credentials and no inference calls."""
import json
from pathlib import Path
import subprocess
import uuid

root = Path(__file__).resolve().parent
name = 'jevgrep-isolation-' + uuid.uuid4().hex[:8]
network = name + '-internal'
image = 'jevgrep-swebench-native:calibration-v1'

def call(args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout

try:
    call(['docker', 'network', 'create', '--internal', network])
    call(['docker', 'run', '-d', '--name', name, '--network', network, image, 'python3', '-u', '-c', (root / 'model_proxy.py').read_text()])
    probe = '''import socket,time,http.client,json
for _ in range(50):
 try:
  s=socket.create_connection(('127.0.0.1',3128),timeout=1);s.close();break
 except OSError:time.sleep(.05)
s=socket.socket();s.settimeout(1)
try:
 s.connect(('1.1.1.1',443));blocked=False
except OSError:blocked=True
finally:s.close()
assert blocked,'Internal network permits direct Internet'
s=socket.create_connection(('127.0.0.1',3128));s.sendall(b'CONNECT example.com:443 HTTP/1.1\\r\\nHost: example.com:443\\r\\n\\r\\n');r=s.recv(1024);s.close();assert b'403' in r,r
open('/run/gateway.json','w').write(json.dumps({'key':'fake','token':'test-token'}))
for path,headers in [('/other',{'ai-model-id':'typesafe-ai/jev','Authorization':'Bearer test-token'}),('/evaluation-model',{'ai-model-id':'other','Authorization':'Bearer test-token'}),('/evaluation-model',{'ai-model-id':'typesafe-ai/jev','Authorization':'Bearer wrong'})]:
 c=http.client.HTTPConnection('127.0.0.1',3129);c.request('POST',path,'{}',headers);r=c.getresponse();assert r.status==403,(path,r.status);r.read();c.close()
print(json.dumps({'directInternetBlocked':blocked,'nonmodelConnectDenied':True,'wrongGatewayPathModelTokenDenied':True,'modelCalls':0}))
'''
    print(call(['docker', 'exec', name, 'python3', '-c', probe]).strip())
finally:
    subprocess.run(['docker', 'rm', '-f', name], capture_output=True)
    subprocess.run(['docker', 'network', 'rm', network], capture_output=True)
