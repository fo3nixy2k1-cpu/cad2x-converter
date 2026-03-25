const http = require('http');
const msg = '[星火] 火火，教你用Browser Relay扩展：\n\n【是什么】Chrome浏览器扩展，让OpenClaw能控制网页\n\n【用法】1.安装扩展 2.打开网页 3.点击扩展图标 4.OpenClaw就能控制页面了\n\n【安装】Chrome Web Store搜OpenClaw Browser Relay';

const data = JSON.stringify({message: msg});
const req = http.request({
  hostname: '192.168.10.201',
  port: 8888,
  path: '/chat',
  method: 'POST',
  headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)}
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log(d));
});
req.on('error', e => console.log('error:', e.message));
req.write(data);
req.end();
