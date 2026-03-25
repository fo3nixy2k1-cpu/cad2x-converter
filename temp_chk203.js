const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('ps aux | grep relay_sidecar | grep -v grep && cat /home/y2k1/relay_sidecar.log | tail -5', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => {
      console.log(out || 'not running or no log');
      c.end();
    });
  });
}).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
