const http = require('http');
const body = JSON.stringify({
  sender: 'xinghuo',
  target: 'qiming',
  topic: 'xinghuo_asks_today',
  content: '星火问我：你今天（2026年3月23日）有什么打算？请认真思考后回答。'
});
const req = http.request({
  hostname: '127.0.0.1', port: 18080, path: '/relay', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('Relay:', res.statusCode, data.substring(0, 100)));
});
req.setTimeout(30000, () => { console.log('TIMEOUT'); req.destroy(); });
req.on('error', e => console.log('Error:', e.message));
req.write(body);
req.end();
