const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('cat /home/y2k1/relay_sidecar.log 2>/dev/null | tail -5', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => { console.log(out || 'no log'); c.end(); });
  });
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
