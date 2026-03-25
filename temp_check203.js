const {Client} = require('ssh2');

const c = new Client();
c.on('ready', () => {
  c.exec('ps aux | grep relay_sidecar | grep -v grep; netstat -tlnp | grep 18081', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => {
      console.log(out || 'Sidecar not running');
      // Start it
      c.exec('cd /home/y2k1 && nohup node relay_sidecar.js > relay_sidecar.log 2>&1 & sleep 2 && ps aux | grep relay_sidecar | grep -v grep && netstat -tlnp | grep 18081', (err2, stream2) => {
        let out2 = '';
        stream2.on('data', d => out2 += d);
        stream2.on('end', () => { console.log(out2); c.end(); });
      });
    });
  });
}).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
