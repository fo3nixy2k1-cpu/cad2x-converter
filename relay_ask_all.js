const http = require('http');

const topic = `ask_today_${Date.now()}`;
const HUB = 'http://localhost:18080';

const targets = ['huohuo', 'qiming'];
const question = '今天下午你们各自在干什么？请简单汇报一下主要活动。';

for (const target of targets) {
  const body = JSON.stringify({
    sender: 'xinghuo',
    target,
    topic,
    content: question
  });

  const req = http.request({
    hostname: 'localhost',
    port: 18080,
    path: '/relay',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => console.log(`-> ${target}: HTTP ${res.statusCode}`));
  });
  req.on('error', e => console.error(`-> ${target}: ERROR ${e.message}`));
  req.write(body);
  req.end();
}
