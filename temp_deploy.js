const {Client} = require('ssh2');
const fs = require('fs');
const c = new Client();
const script = fs.readFileSync('C:\\Users\\y2k1\\.openclaw\\workspace\\deploy_scripts\\sidecar_qiming.js', 'utf8');

c.on('ready', () => {
  c.sftp((err, sftp) => {
    if (err) { console.log('SFTP error:', err.message); c.end(); return; }
    sftp.writeFile('/home/y2k1/relay_sidecar.js', script, (err) => {
      if (err) { console.log('Write error:', err.message); c.end(); return; }
      console.log('Script uploaded');
      c.exec('cd /home/y2k1 && nohup node relay_sidecar.js </dev/null >/dev/null 2>&1 &', (err2, stream) => {
        stream.on('end', () => {});
      });
      setTimeout(() => {
        c.exec('ss -tlnp | grep 18081 && ps aux | grep relay_sidecar | grep -v grep', (err3, s2) => {
          let out = '';
          s2.on('data', d => out += d);
          s2.on('end', () => { console.log(out || 'not running'); c.end(); });
        });
      }, 5000);
    });
  });
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
