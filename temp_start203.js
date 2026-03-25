const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('cd /home/y2k1 && nohup node relay_sidecar.js > /dev/null 2>&1 &', (err, stream) => {
    stream.on('end', () => {});
  });
  setTimeout(() => {
    c.exec('ps aux | grep relay | grep -v grep && curl -s http://127.0.0.1:18081/ 2>&1 | head -3', (err, s) => {
      let out = '';
      s.on('data', d => out += d);
      s.on('end', () => { console.log(out || 'not running'); c.end(); });
    });
  }, 5000);
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
