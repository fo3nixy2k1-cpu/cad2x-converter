const {Client} = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = 'powershell -Command "cd C:\\Users\\fo3nix; Start-Process -FilePath node -ArgumentList relay_sidecar.js -WindowStyle Hidden -PassThru | Select-Object Id"';
  conn.exec(cmd, (err, stream) => {
    if (err) { console.error('exec err:', err); conn.end(); return; }
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => { console.log(out); conn.end(); });
  });
}).on('error', e => console.error('conn err:', e.message)).connect({
  host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a'
});
