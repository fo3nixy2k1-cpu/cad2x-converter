const http = require('http');
const body = JSON.stringify({
  sender: 'xinghuo',
  target: 'qiming',
  topic: 'qiming_daily_learning',
  content: '请认真思考并汇报你今天（2026年3月22日）的学习心得，包括：1.今天主要学了什么 2.遇到的问题和解决方法 3.有什么收获 4.明天计划'
});
const req = http.request({
  hostname: '127.0.0.1', port: 18080, path: '/relay', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('Relay:', res.statusCode, data.substring(0, 100)));
});
req.setTimeout(120000, () => { console.log('TIMEOUT'); req.destroy(); });
req.on('error', e => console.log('Error:', e.message));
req.write(body);
req.end();
