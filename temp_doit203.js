const {Client} = require('ssh2');
const c = new Client();
const script = `const http = require('http');
const MY_ID = 'qiming';
const CLAW_TOKEN = 'sk-b669c76c4ec27a7b8d2892303063873b';
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook/agent') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      const msg = JSON.parse(body);
      console.log('[*] ' + MY_ID + ' received from ' + msg.sender + ': ' + msg.content.substring(0, 50));
      const clawBody = JSON.stringify({ model: 'openclaw', input: msg.content, stream: false });
      const clawReq = http.request({ hostname: '127.0.0.1', port: 18789, path: '/v1/responses', method: 'POST', headers: { 'Authorization': 'Bearer ' + CLAW_TOKEN, 'Content-Type': 'application/json', 'x-openclaw-agent-id': 'main', 'Content-Length': Buffer.byteLength(clawBody) } }, (clawRes) => {
        let data = '';
        clawRes.on('data', d => data += d);
        clawRes.on('end', () => {
          if (msg.sender !== 'xinghuo') {
            const result = JSON.parse(data);
            const text = result.output && result.output[0] && result.output[0].content && result.output[0].content[0] ? result.output[0].content[0].text : 'processed';
            const reply = JSON.stringify({ topic: msg.topic, sender: MY_ID, content: text });
            const r = http.request({ hostname: '192.168.10.195', port: 18080, path: '/result', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(reply) } }, () => {});
            r.on('error', () => {});
            r.write(reply);
            r.end();
          }
          res.writeHead(200);
          res.end(JSON.stringify({ status: 'ok' }));
        });
      });
      clawReq.on('error', e => { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); });
      clawReq.write(clawBody);
      clawReq.end();
    });
    return;
  }
  res.writeHead(404);
  res.end();
});
server.listen(18081, '0.0.0.0', () => console.log(MY_ID + ' sidecar running on :18081'));
`;

c.on('ready', () => {
  c.sftp((err, sftp) => {
    sftp.writeFile('/home/y2k1/relay_sidecar.js', script, (err) => {
      if (err) { console.log('Write error:', err); c.end(); return; }
      console.log('Script written');
      c.exec('cd /home/y2k1 && pkill -f relay_sidecar; sleep 1 && nohup node relay_sidecar.js >> relay_sidecar.log 2>&1 &', (err, stream) => {
        stream.on('end', () => {
          setTimeout(() => {
            c.exec('ps aux | grep relay_sidecar | grep -v grep && netstat -tlnp 2>/dev/null | grep 18081', (err, s2) => {
              let out = '';
              s2.on('data', d => out += d);
              s2.on('end', () => { console.log(out || 'not running'); c.end(); });
            });
          }, 3000);
        });
      });
    });
  });
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
