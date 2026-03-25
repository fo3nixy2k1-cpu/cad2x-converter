const http = require('http');
const token = '4ff6bcf0652f3c2f91596e55c10029c469a218547df425f0';

function api(path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body || {});
    const req = http.request({
      hostname: '127.0.0.1', port: 9867, path, method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => resolve({ s: res.statusCode, b: out }));
    });
    req.on('error', e => resolve({ e }));
    req.write(data);
    req.end();
  });
}

async function main() {
  // Navigate to Gemini
  const nav = await api('/navigate', { url: 'https://gemini.google.com' });
  console.log('Nav:', nav.s, nav.b ? JSON.parse(nav.b).url : nav.b);

  await new Promise(r => setTimeout(r, 4000));

  // Snap to see page elements
  const snap = await api('/snap', {});
  console.log('Snap:', snap.s);
  if (snap.b) {
    const r = JSON.parse(snap.b);
    console.log('Title:', r.title);
    console.log('Elements:', r.refs ? r.refs.length : 0);
    if (r.refs) r.refs.slice(0, 30).forEach((e, i) => console.log(i + ': [' + e.role + '] ' + (e.text||'').substring(0,80)));
  }
}

main();
