const http = require('http');
const body = JSON.stringify({
  sender: 'xinghuo',
  target: 'qiming',
  topic: 'qiming_status',
  content: 'echo "=== 启明资源汇报 ===" && echo "时间: $(date)" && echo "" && echo "=== 负载 ===" && uptime && echo "" && echo "=== 内存 ===" && free -h && echo "" && echo "=== 磁盘 ===" && df -h'
});
const req = http.request({
  hostname: '127.0.0.1', port: 18080, path: '/relay', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('Relay:', res.statusCode, data.substring(0, 100)));
});
req.setTimeout(60000, () => { console.log('TIMEOUT'); req.destroy(); });
req.on('error', e => console.log('Error:', e.message));
req.write(body);
req.end();
