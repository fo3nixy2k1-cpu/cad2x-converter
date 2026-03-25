const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('netstat -tlnp | grep 18081', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => {
      console.log(out || 'nothing on 18081');
      c.exec('ps aux | grep node | grep -v grep', (err2, s2) => {
        let out2 = '';
        s2.on('data', d => out2 += d);
        s2.on('end', () => { console.log(out2); c.end(); });
      });
    });
  });
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
