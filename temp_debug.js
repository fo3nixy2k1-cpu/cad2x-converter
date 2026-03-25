const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('cd /home/y2k1 && node relay_sidecar.js 2>&1 &', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => { console.log('start:', out); });
  });
  setTimeout(() => {
    c.exec('ps aux | grep relay | grep -v grep; cat relay_sidecar.log | tail -5', (err, stream) => {
      let out = '';
      stream.on('data', d => out += d);
      stream.on('end', () => { console.log(out); c.end(); });
    });
  }, 5000);
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
