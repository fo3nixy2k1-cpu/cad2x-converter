const {Client} = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = 'powershell -Command "Get-Content C:\\Users\\fo3nix\\relay_sidecar.log -Tail 10 -ErrorAction SilentlyContinue"';
  conn.exec(cmd, (err, stream) => {
    if (err) { console.error('exec err:', err); conn.end(); return; }
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => { console.log(out||'empty'); conn.end(); });
  });
}).on('error', e => console.error('conn err:', e.message)).connect({
  host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a'
});
