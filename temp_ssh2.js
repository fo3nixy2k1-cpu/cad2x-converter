const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('cd /home/y2k1 && nohup node relay_sidecar.js > relay_sidecar.log 2>&1 &', (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.on('end', () => {
      setTimeout(() => {
        c.exec('ps aux | grep relay_sidecar | grep -v grep', (err2, s2) => {
          let out = '';
          s2.on('data', d => out += d);
          s2.on('end', () => { console.log(out || 'not running'); c.end(); });
        });
      }, 3000);
    });
  });
}).on('error', e => console.log('SSH error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
