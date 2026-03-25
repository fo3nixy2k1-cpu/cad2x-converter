const http = require('http');
const body = JSON.stringify({
  sender: 'xinghuo',
  target: 'qiming',
  topic: 'resource_check_001',
  content: '请汇报一下你这台服务器的CPU、内存、磁盘使用情况'
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
  res.on('end', () => console.log('Status:', res.statusCode, data.substring(0, 100)));
});
req.setTimeout(30000, () => { console.log('TIMEOUT'); req.destroy(); });
req.on('error', e => console.log('Error:', e.message));
req.write(body);
req.end();
