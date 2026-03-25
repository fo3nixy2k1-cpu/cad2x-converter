const http = require('http');
const token = 'f6b4bb1ed44c47fa3755b93d8b65b78f786c17c6d9c65582';
const tabId = '7E024A68FCEC97E71E439C0B6E130A9D'; // from earlier nav

// Test snap via HTTP
const snapReq = http.request({
  hostname: '127.0.0.1', port: 9867, path: '/snap', method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'x-ptab-id': tabId, 'Content-Length': 2 }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    console.log('Snap status:', res.statusCode);
    try {
      const r = JSON.parse(data);
      console.log('Refs:', r.refs ? r.refs.length : 0);
      if (r.refs) r.refs.slice(0, 20).forEach((x,i) => console.log(i + ': [' + x.role + '] ' + x.text.substring(0,80)));
    } catch(e) { console.log(data.substring(0, 300)); }
  });
});
snapReq.on('error', e => console.log('Error:', e.message));
snapReq.write('{}');
snapReq.end();
