const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('pkill -9 -f relay_sidecar; sleep 2; cd /home/y2k1 && nohup node relay_sidecar.js >> relay_sidecar.log 2>&1 & sleep 3 && ps aux | grep relay_sidecar | grep -v grep && netstat -tlnp | grep 18081', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => { console.log(out); c.end(); });
  });
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
