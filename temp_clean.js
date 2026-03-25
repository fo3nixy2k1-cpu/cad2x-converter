const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('fuser -k 18081/tcp 2>/dev/null; sleep 2; cd /home/y2k1 && nohup node relay_sidecar.js </dev/null >/dev/null 2>&1 &', (err, stream) => {
    stream.on('end', () => {});
  });
  setTimeout(() => {
    c.exec('ps aux | grep relay_sidecar | grep -v grep; ss -tlnp state listening | grep 18081', (err, s) => {
      let out = '';
      s.on('data', d => out += d);
      s.on('end', () => { console.log(out); c.end(); });
    });
  }, 8000);
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
