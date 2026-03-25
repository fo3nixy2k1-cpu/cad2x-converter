const {Client}=require('ssh2');
const fs=require('fs');
const c=new Client();
c.on('ready',()=>{
  const pyCode = `#!/usr/bin/env python3
"""Relay Sidecar for 203 qiming - Python version - WITH result callback"""
import json, os, urllib.request, urllib.parse, datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

MY_ID = 'qiming'
CLAW_TOKEN = 'sk-b669c76c4ec27a7b8d2892303063873b'
CLAW_URL = 'http://127.0.0.1:18789/v1/responses'
HUB_RESULT_URL = 'http://192.168.10.195:18080/result'
RESULT_DIR = '/home/y2k1/relay_results/'
PORT = 18081

os.makedirs(RESULT_DIR, exist_ok=True)

def save_result(topic, sender, content):
    result_file = os.path.join(RESULT_DIR, f'result_{topic}.txt')
    with open(result_file, 'w', encoding='utf-8') as f:
        f.write(f'[{datetime.datetime.now().isoformat()}] From {sender} (topic: {topic}):\\n{content}\\n')
    print(f'[+] Saved: {result_file}')

def call_claw(message):
    body = json.dumps({'model': 'openclaw', 'input': message, 'stream': False}).encode()
    req = urllib.request.Request(CLAW_URL, data=body, headers={
        'Authorization': f'Bearer {CLAW_TOKEN}',
        'Content-Type': 'application/json',
        'x-openclaw-agent-id': 'main'
    }, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            return resp.read().decode('utf-8')
    except Exception as e:
        print(f'Claw error: {e}')
        return None

def send_to_hub(topic, sender, content):
    body = json.dumps({'sender': sender, 'topic': topic, 'content': content}).encode()
    req = urllib.request.Request(HUB_RESULT_URL, data=body, headers={
        'Content-Type': 'application/json'
    }, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f'[→] Result sent to Hub: {resp.status}')
    except Exception as e:
        print(f'Hub send error: {e}')

class SidecarHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/webhook/agent':
            self.send_response(404); self.end_headers(); return
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        msg = json.loads(body)
        sender, topic, content = msg.get('sender',''), msg.get('topic',''), msg.get('content','')
        print(f'[*] {MY_ID} received from {sender}: {content[:60]}')
        save_result(topic, sender, content)
        # Call local OpenClaw and send response back to Hub
        response = call_claw(f'[{sender}]: {content}')
        if response:
            send_to_hub(topic, MY_ID, response)
        else:
            send_to_hub(topic, MY_ID, '(no response from local OpenClaw)')
        self.send_response(200); self.end_headers()
        self.wfile.write(json.dumps({'status': 'ok'}).encode())
    def log_message(self, format, *args):
        print(f'[Sidecar-{MY_ID}] {format % args}')

HTTPServer(('0.0.0.0', PORT), SidecarHandler).serve_forever()
`;
  const escaped = pyCode.replace(/'/g, "'\\''");
  const cmd = `cat > /home/y2k1/relay_sidecar.py << 'PYEOF'\n${pyCode}\nPYEOF`;
  c.exec(cmd, (e2,s2)=>{
    let o=''; s2.on('data',d=>o+=d); s2.on('close',()=>{
      console.log('Uploaded');
      c.exec('pkill -f "relay_sidecar" 2>/dev/null; sleep 1; cd ~ && nohup python3 relay_sidecar.py > relay_sidecar.log 2>&1 &', (e3,s3)=>{
        let o3=''; s3.on('data',d=>o3+=d); s3.on('close',()=>{ console.log(o3); c.end(); });
      });
    });
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
