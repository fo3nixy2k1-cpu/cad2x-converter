const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  // Kill old sidecar by PID if known, or kill all node relay processes
  c.exec('kill -9 221018 2>/dev/null; killall -9 node 2>/dev/null; sleep 2; cd /home/y2k1 && node relay_sidecar.js &', (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.on('end', () => {
      setTimeout(() => {
        c.exec('ps aux | grep relay | grep -v grep; cat relay_sidecar.log | tail -3', (err2, s2) => {
          let out = '';
          s2.on('data', d => out += d);
          s2.on('end', () => { console.log(out); c.end(); });
        });
      }, 5000);
    });
  });
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
