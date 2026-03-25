const http = require('http');
const msg = '火火，请问现在几点了？';
const d = JSON.stringify({sender: '星火', message: msg});
const options = {
    hostname: '192.168.10.195',
    port: 8080,
    path: '/webhook',
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(d)}
};
const req = http.request(options, res => {
    let s = '';
    res.on('data', c => s += c);
    res.on('end', () => console.log('响应:', s));
});
req.on('error', e => console.log('错误:', e.message));
req.write(d);
req.end();
