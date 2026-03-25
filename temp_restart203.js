const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  console.log('Connected');
  c.exec('pkill -f relay_sidecar; sleep 1; cd /home/y2k1 && nohup node relay_sidecar.js > relay_sidecar.log 2>&1 & sleep 2 && ps aux | grep relay_sidecar | grep -v grep && cat relay_sidecar.log', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => { console.log(out); c.end(); });
  });
}).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
