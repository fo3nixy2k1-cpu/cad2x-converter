const http = require('http');
const body = JSON.stringify({ model: 'openclaw', input: 'hi', stream: false });
const req = http.request({
  hostname: '192.168.10.203', port: 18789, path: '/v1/responses', method: 'POST',
  headers: { 'Authorization': 'Bearer sk-b669c76c4ec27a7b8d2892303063873b', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Response:', data.substring(0, 100)));
});
req.setTimeout(10000, () => { console.log('TIMEOUT'); req.destroy(); });
req.on('error', e => console.log('Error:', e.message));
req.write(body);
req.end();
