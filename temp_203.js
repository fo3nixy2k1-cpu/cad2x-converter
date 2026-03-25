const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('ps aux | grep relay | grep -v grep; netstat -tlnp | grep 18081', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => { console.log(out || 'sidecar not running'); c.end(); });
  });
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
