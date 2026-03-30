const {Client} = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  // Use a persistent PowerShell session to keep connection alive
  conn.exec('powershell -NoExit -Command "cd C:\\Users\\fo3nix; Write-Host \\'ready\\'; Get-Content openclaw.json | Select-String token"', (err, stream) => {
    if (err) { console.error('exec err:', err); conn.end(); return; }
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => { console.log(out); conn.end(); });
  });
}).on('error', e => console.error('conn err:', e.message)).connect({
  host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a'
});
