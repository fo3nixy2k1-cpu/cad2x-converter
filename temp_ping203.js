const http = require('http');
// Test direct connection to 203 sidecar
const req = http.request({
  hostname: '192.168.10.203',
  port: 18081,
  path: '/webhook/agent',
  method: 'POST',
  timeout: 5000
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('203 sidecar:', res.statusCode, data.substring(0, 100)));
});
req.on('error', e => console.log('Error:', e.message));
req.on('timeout', () => { console.log('TIMEOUT'); req.destroy(); });
req.write(JSON.stringify({ sender: 'test', topic: 't1', content: 'hello' }));
req.end();
