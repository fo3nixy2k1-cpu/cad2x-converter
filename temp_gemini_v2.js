const http = require('http');
const token = '4ff6bcf0652f3c2f91596e55c10029c469a218547df425f0';

function pinch(path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body || {});
    const req = http.request({
      hostname: '127.0.0.1', port: 9867, path, method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ s: res.statusCode, b: d }));
    });
    req.on('error', e => resolve({ e }));
    req.write(data);
    req.end();
  });
}

(async () => {
  console.log('Testing PinchTab with token:', token.substring(0, 8) + '...');
  
  const nav = await pinch('/navigate', { url: 'https://gemini.google.com' });
  console.log('Nav:', nav.s, nav.b ? JSON.parse(nav.b).url || nav.b.substring(0,100) : '');
  
  if (nav.s !== 200) {
    // Try text extraction
    const txt = await pinch('/text', {});
    console.log('Text:', txt.s, txt.b ? txt.b.substring(0,200) : '');
    return;
  }
  
  await new Promise(r => setTimeout(r, 3000));
  
  const snap = await pinch('/snap', {});
  console.log('Snap:', snap.s);
  if (snap.b) {
    const r = JSON.parse(snap.b);
    console.log('Title:', r.title, '| Refs:', r.refs?.length || 0);
    r.refs?.slice(0, 20).forEach((e, i) => console.log(i + ': [' + e.role + '] ' + (e.text||'').substring(0,80)));
  }
})();
