const http = require('http');

function test(token) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1', port: 9867, path: '/navigate', method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Content-Length': 62 }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ t: token.substring(0,8), s: res.statusCode, b: d.substring(0,50) }));
    });
    req.on('error', e => resolve({ t: token.substring(0,8), e: e.message }));
    req.write(JSON.stringify({ url: 'https://gemini.google.com' }));
    req.end();
  });
}

(async () => {
  const r1 = await test('f6b4bb1ed44c47fa3755b93d8b65b78f786c17c6d9c65582');
  console.log('Old token:', r1.s, r1.b || r1.e);
  const r2 = await test('4ff6bcf0652f3c2f91596e55c10029c469a218547df425f0');
  console.log('New token:', r2.s, r2.b || r2.e);
})();
