const http = require('http');
const token = 'f6b4bb1ed44c47fa3755b93d8b65b78f786c17c6d9c65582';

const req = http.request({
  hostname: '127.0.0.1', port: 9867, path: '/snap', method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Content-Length': 2 }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log('Status:', res.statusCode);
    console.log('Refs count:', result.refs ? result.refs.length : 0);
    if (result.refs) {
      result.refs.slice(0, 30).forEach((r, i) => {
        console.log(i + ': ' + r.role + ' | ' + r.text.substring(0, 80));
      });
    }
  });
});
req.on('error', e => console.log('Error:', e.message));
req.write('{}');
req.end();
