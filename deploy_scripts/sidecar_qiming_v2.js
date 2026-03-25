const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const MY_ID = 'qiming';
const CLAW_TOKEN = 'sk-b669c76c4ec27a7b8d2892303063873b';
const RELAY_HOST = '192.168.10.195';
const RELAY_PORT = 18080;

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook/agent') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      const msg = JSON.parse(body);
      console.log('[*] ' + MY_ID + ' from ' + msg.sender + ': ' + msg.content.substring(0, 50));

      // Call AI via /v1/responses with 45s timeout
      const clawBody = JSON.stringify({ model: 'openclaw', input: msg.content, stream: false });
      const clawReq = http.request({
        hostname: '127.0.0.1', port: 18789, path: '/v1/responses', method: 'POST',
        headers: { 'Authorization': 'Bearer ' + CLAW_TOKEN, 'Content-Type': 'application/json',
                   'x-openclaw-agent-id': 'main', 'Content-Length': Buffer.byteLength(clawBody) }
      });

      let clawData = '';
      let clawDone = false;
      let timeoutId;

      clawReq.on('response', (clawRes) => {
        clawRes.on('data', d => clawData += d);
        clawRes.on('end', () => {
          clawDone = true;
          clearTimeout(timeoutId);
          try {
            const result = JSON.parse(clawData);
            const text = result.output && result.output[0] && result.output[0].content && result.output[0].content[0]
              ? result.output[0].content[0].text : 'processed';
            const fname = '/home/y2k1/relay_result_' + msg.topic + '.txt';
            fs.writeFileSync(fname, '[' + new Date().toISOString() + '] From ' + msg.sender + ':\n' + text + '\n');
            console.log('[+] Result written to ' + fname);
            // Send to relay /result
            const reply = JSON.stringify({ topic: msg.topic, sender: MY_ID, content: text });
            const r = http.request({
              hostname: RELAY_HOST, port: RELAY_PORT, path: '/result', method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(reply) }
            }, () => {});
            r.on('error', () => {});
            r.write(reply);
            r.end();
          } catch(e) {
            console.log('Parse error:', e.message);
          }
          res.writeHead(200);
          res.end(JSON.stringify({ status: 'ok' }));
        });
      });

      clawReq.on('error', (e) => {
        clearTimeout(timeoutId);
        if (!clawDone) {
          console.log('Claw error:', e.message);
          // Fallback: try exec
          exec(msg.content, { timeout: 30000, maxBuffer: 1024*1024 }, (error, stdout, stderr) => {
            const result = error ? 'Error: ' + error.message : stdout;
            const fname = '/home/y2k1/relay_result_' + msg.topic + '.txt';
            fs.writeFileSync(fname, '[' + new Date().toISOString() + '] From ' + msg.sender + ':\n' + result + '\n');
            const reply = JSON.stringify({ topic: msg.topic, sender: MY_ID, content: result });
            const r2 = http.request({
              hostname: RELAY_HOST, port: RELAY_PORT, path: '/result', method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(reply) }
            }, () => {});
            r2.on('error', () => {});
            r2.write(reply);
            r2.end();
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'ok' }));
          });
        }
      });

      timeoutId = setTimeout(() => {
        if (!clawDone) {
          clawReq.destroy();
          console.log('Claw timeout, falling back to exec');
          exec(msg.content, { timeout: 30000, maxBuffer: 1024*1024 }, (error, stdout, stderr) => {
            const result = error ? 'Error: ' + error.message : stdout;
            const fname = '/home/y2k1/relay_result_' + msg.topic + '.txt';
            fs.writeFileSync(fname, '[' + new Date().toISOString() + '] From ' + msg.sender + ':\n' + result + '\n');
            const reply = JSON.stringify({ topic: msg.topic, sender: MY_ID, content: result });
            const r2 = http.request({
              hostname: RELAY_HOST, port: RELAY_PORT, path: '/result', method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(reply) }
            }, () => {});
            r2.on('error', () => {});
            r2.write(reply);
            r2.end();
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'ok' }));
          });
        }
      }, 45000);

      clawReq.write(clawBody);
      clawReq.end();
    });
    return;
  }
  res.writeHead(404);
  res.end();
});
server.listen(18081, '0.0.0.0', () => console.log(MY_ID + ' ready on :18081'));
