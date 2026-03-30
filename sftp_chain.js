const {Client} = require('ssh2');

const script = `
const MY_ID = 'huohuo';
const RELAY = 'http://192.168.10.195:18080/relay';
const CLAW_URL = 'http://127.0.0.1:18789/v1/responses';
const CLAW_TOKEN = 'TOKEN_PLACEHOLDER';

const http = require('http');
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook/agent') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      const msg = JSON.parse(body);
      console.log('[*] ' + MY_ID + ' got: ' + msg.content);

      const clawBody = JSON.stringify({
        model: 'openclaw',
        input: msg.content,
        stream: false
      });

      const clawReq = http.request({
        hostname: '127.0.0.1',
        port: 18789,
        path: '/v1/responses',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + CLAW_TOKEN,
          'Content-Type': 'application/json',
          'x-openclaw-agent-id': 'main',
          'Content-Length': Buffer.byteLength(clawBody)
        }
      }, (clawRes) => {
        let data = '';
        clawRes.on('data', d => data += d);
        clawRes.on('end', () => {
          if (msg.sender !== 'xinghuo') {
            const result = JSON.parse(data);
            const text = result.output?.[0]?.content?.[0]?.text || 'done';
            const reply = JSON.stringify({
              topic: msg.topic,
              sender: MY_ID,
              target: 'xinghuo',
              content: text
            });
            const rp = http.request(RELAY, {method:'POST', headers:{'Content-Type':'application/json'}}, () => {});
            rp.on('error', e => console.error('relay err:', e));
            rp.write(reply);
            rp.end();
          }
          res.writeHead(200);
          res.end(JSON.stringify({ status: 'ok' }));
        });
      });
      clawReq.on('error', e => { console.error('claw err:', e); res.writeHead(500); res.end(); });
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

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) { console.error('sftp err:', err); conn.end(); return; }
    sftp.writeFile('C:\\Users\\fo3nix\\relay_sidecar.js', script, (err) => {
      if (err) { console.error('write err:', err); conn.end(); return; }
      console.log('uploaded');
      conn.exec('cmd /c "ping -n 2 127.0.0.1 >nul & netstat -ano | findstr 18081"', (err, stream) => {
        if (err) { console.error('exec err:', err); conn.end(); return; }
        let out = '';
        stream.on('data', d => out += d);
        stream.on('close', () => { console.log(out||'no output'); conn.end(); });
      });
    });
  });
}).on('error', e => console.error('conn err:', e.message)).connect({
  host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a'
});
