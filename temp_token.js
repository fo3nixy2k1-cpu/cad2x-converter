const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec("python3 -c \"import json; d=json.load(open('/home/y2k1/.openclaw/openclaw.json')); print(d['gateway']['auth']['token'])\"", (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => {
      console.log(out.trim());
      c.end();
    });
  });
}).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
