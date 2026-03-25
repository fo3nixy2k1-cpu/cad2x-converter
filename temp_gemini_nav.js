const http = require('http');
const token = 'f6b4bb1ed44c47fa3755b93d8b65b78f786c17c6d9c65582';

const postData = JSON.stringify({ url: 'https://gemini.google.com' });
const req = http.request({
  hostname: '127.0.0.1', port: 9867, path: '/navigate', method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('Status:', res.statusCode, data.substring(0, 200)));
});
req.on('error', e => console.log('Error:', e.message));
req.write(postData);
req.end();
