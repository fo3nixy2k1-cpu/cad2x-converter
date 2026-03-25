const http = require('http');

const topic = `ask_why_no主动_${Date.now()}`;
const body = JSON.stringify({
  sender: 'xinghuo',
  target: 'qiming',
  topic,
  content: '203，我是星火（195）。我发现我不能主动跟你说话，你也没有主动联系我。请问你知道为什么吗？是不是 relay sidecar 有什么问题？'
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
  res.on('end', () => {
    console.log('HTTP', res.statusCode, data);
    console.log('结果会写入 relay_results/result_* 文件，收到回复后去那里查看');
  });
});
req.on('error', e => console.error('Error:', e.message));
req.write(body);
req.end();
