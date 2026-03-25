const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const MY_ID = 'qiming';

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook/agent') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      const msg = JSON.parse(body);
      console.log('[*] ' + MY_ID + ' from ' + msg.sender + ': ' + msg.content.substring(0, 50));

      // Execute the command directly
      exec(msg.content, { timeout: 30000, maxBuffer: 1024*1024 }, (error, stdout, stderr) => {
        const result = error ? 'Error: ' + error.message : stdout;
        console.log('[+] Result length:', result.length);
        
        // Write to file
        const fname = '/home/y2k1/relay_result_' + msg.topic + '.txt';
        fs.writeFileSync(fname, '[' + new Date().toISOString() + '] From ' + msg.sender + ':\n' + result + '\n');
        console.log('[+] Written to ' + fname);

        // Send to relay /result
        const reply = JSON.stringify({ topic: msg.topic, sender: MY_ID, content: result });
        const r = http.request({
          hostname: '192.168.10.195', port: 18080, path: '/result', method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(reply) }
        }, () => {});
        r.on('error', e => console.log('Result send error:', e.message));
        r.write(reply);
        r.end();

        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
      });
    });
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(18081, '0.0.0.0', () => console.log(MY_ID + ' ready on :18081'));
