const {Client} = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  // One liner: read token, replace in script, start sidecar, check port
  const cmd = `powershell -Command "$t=(Select-String 'token' C:\\Users\\fo3nix\\.openclaw\\openclaw.json | Select-Object -First 1).Line -replace '.*token.*:\\s*[\\'\\"]?([^\\'\\"\\,\\s]+).*','$1'; $s=Get-Content C:\\Users\\fo3nix\\relay_sidecar.js -Raw; $s=$s -replace 'TOKEN_PLACEHOLDER',$t; Set-Content C:\\Users\\fo3nix\\relay_sidecar.js -Value $s; Start-Process node -ArgumentList relay_sidecar.js -WorkingDirectory C:\\Users\\fo3nix -WindowStyle Hidden; Start-Sleep 2; if((Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue)){Write-Host 'SUCCESS: port 18081 open'}else{Write-Host 'FAILED: port 18081 not open'}"`;
  conn.exec(cmd, (err, stream) => {
    if (err) { console.error('exec err:', err); conn.end(); return; }
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => { console.log(out||'no output'); conn.end(); });
  });
}).on('error', e => console.error('conn err:', e.message)).connect({
  host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a'
});
