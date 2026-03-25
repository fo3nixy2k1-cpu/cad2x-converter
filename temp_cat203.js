const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('tail -60 /home/y2k1/.openclaw/workspace/memory/2026-03-22.md', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => {
      console.log(out || 'empty');
      c.end();
    });
  });
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
