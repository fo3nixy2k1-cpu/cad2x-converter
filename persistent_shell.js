const {Client} = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('ready');
  conn.shell({term:'vt100', cols:200, rows:40}, (err, stream) => {
    if (err) { console.error('shell err:', err); conn.end(); return; }
    let buf = '';
    stream.on('data', d => { process.stdout.write(d); buf += d; });
    stream.on('close', () => { console.log('shell closed'); conn.end(); });
    
    setTimeout(() => {
      stream.write('cd /d C:\\Users\\fo3nix\r');
      setTimeout(() => {
        stream.write('powershell -Command "Get-Content relay_sidecar.js | Select-Object -First 5"\r');
        setTimeout(() => {
          stream.write('node relay_sidecar.js\r');
          setTimeout(() => stream.write('exit\r'), 3000);
        }, 2000);
      }, 2000);
    }, 1000);
  });
}).on('error', e => console.error('conn err:', e.message)).connect({
  host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a'
});
