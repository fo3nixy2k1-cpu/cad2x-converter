const {Client} = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('powershell -Command "Select-String -Path C:\\Users\\fo3nix\\.openclaw\\openclaw.json -Pattern token | ForEach-Object { $_.Line }"', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => { console.log(out); conn.end(); });
  });
}).on('error', e => console.error('conn err:', e.message)).connect({host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a'});
