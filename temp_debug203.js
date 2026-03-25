const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  // Test 1: direct local curl
  c.exec("time curl -s -m 15 -X POST http://127.0.0.1:18789/v1/responses -H 'Authorization: Bearer sk-b669c76c4ec27a7b8d2892303063873b' -H 'Content-Type: application/json' -d '{\"model\":\"openclaw\",\"input\":\"1+1等于?\",\"stream\":false}' 2>&1", (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => {
      console.log('=== Direct test ===');
      console.log(out.substring(0, 300));
      c.end();
    });
  });
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
