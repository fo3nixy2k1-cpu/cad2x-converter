const { Client } = require('ssh2');
const c = new Client();
const body = JSON.stringify({
  sender: 'xinghuo',
  target: 'qiming',
  topic: 'qiming_cpu_report',
  content: '请汇报你这台服务器的CPU型号和核心数'
});

c.on('ready', () => {
  const cmd = `curl -s -X POST http://127.0.0.1:18080/relay -H "Content-Type: application/json" -d '${body}' 2>&1`;
  c.exec(cmd, (e, s) => {
    let out = '';
    s.on('data', d => out += d);
    s.on('close', () => { console.log(out); c.end(); });
  });
}).on('error', e => console.error('SSH Error:', e.message))
  .connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357', readyTimeout: 10000 });
