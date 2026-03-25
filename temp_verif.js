const http = require('http');

const body = JSON.stringify({
  sender: 'xinghuo',
  target: 'qiming',
  topic: 'test_001',
  content: '你好，测试一下协作链路'
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 18080,
  path: '/relay',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('Relay response:', res.statusCode, data.substring(0, 100)));
});
req.on('error', e => console.log('Error:', e.message));
req.write(body);
req.end();
