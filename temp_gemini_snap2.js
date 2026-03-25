const http = require('http');
const token = '4ff6bcf0652f3c2f91596e55c10029c469a218547df425f0';

function apiCall(path, method, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body || {});
    const req = http.request({
      hostname: '127.0.0.1', port: 9867, path, method,
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => resolve({ status: res.statusCode, body: out }));
    });
    req.on('error', e => resolve({ error: e.message }));
    req.write(data);
    req.end();
  });
}

async function main() {
  // Navigate to Gemini
  const nav = await apiCall('/navigate', 'POST', { url: 'https://gemini.google.com' });
  console.log('Navigate:', nav.status, nav.body ? JSON.parse(nav.body).url : nav.body);

  // Wait for page load
  await new Promise(r => setTimeout(r, 3000));

  // Snap page
  const snap = await apiCall('/snap', 'POST', {});
  console.log('Snap status:', snap.status);
  if (snap.body) {
    const r = JSON.parse(snap.body);
    if (r.refs) {
      console.log('Found', r.refs.length, 'elements');
      r.refs.slice(0, 25).forEach((e, i) => {
        const t = e.text ? e.text.substring(0, 100) : '';
        console.log(i + ': [' + e.role + '] ' + t);
      });
    }
  }
}

main();
