const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  // Kill everything on 18081
  c.exec('fuser -k 18081/tcp 2>/dev/null; pkill -9 -f relay_sidecar; sleep 3; ps aux | grep relay | grep -v grep; ss -tlnp | grep 18081', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => { console.log(out); c.end(); });
  });
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
