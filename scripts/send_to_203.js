const http = require('http');
const body = JSON.stringify({
  sender: 'xinghuo',
  target: 'qiming',
  topic: 'check2_2026-03-24',
  content: '今天干什么了？简单汇报一下主要工作。'
});
const req = http.request({
  hostname: '127.0.0.1', port: 18080, path: '/relay', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => { console.log('Status:', res.statusCode, 'Response:', data); });
});
req.on('error', (e) => { console.error('Request error:', e.message); process.exit(1); });
req.write(body);
req.end();
