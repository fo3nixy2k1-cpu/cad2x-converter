const http = require('http');
const token = 'f6b4bb1ed44c47fa3755b93d8b65b78f786c17c6d9c65582';

function pinch(method, path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body || {});
    const req = http.request({
      hostname: '127.0.0.1', port: 9867, path, method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ s: res.statusCode, b: d }));
    });
    req.on('error', e => resolve({ e }));
    if (body) req.write(data);
    req.end();
  });
}

(async () => {
  const nav = await pinch('POST', '/navigate', { url: 'https://gemini.google.com' });
  console.log('Nav:', nav.s);
  if (nav.s !== 200) { console.log(nav.b?.substring(0, 200)); return; }
  
  await new Promise(r => setTimeout(r, 5000));

  const snap = await pinch('POST', '/snap', {});
  if (snap.s === 200) {
    const r = JSON.parse(snap.b);
    console.log('Title:', r.title, '| Refs:', r.refs?.length || 0);
    r.refs?.filter(e => e.role === 'textbox' || e.role === 'button').slice(0, 10)
      .forEach((e, i) => console.log(i + ': [' + e.role + '] ' + (e.text||'').substring(0,80) + ' | ref:' + e.ref));
  } else {
    console.log('Snap error:', snap.s, snap.b?.substring(0, 100));
  }
})();
