const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  const cmd = 'powershell -Command "Get-Content C:\\Users\\fo3nix\\.openclaw\\openclaw.json | Select-String -Pattern token"';
  c.exec(cmd, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => { console.log(out); c.end(); });
  });
}).on('error', e => console.error('err:', e.message)).connect({host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a'});
