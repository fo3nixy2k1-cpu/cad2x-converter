const {Client} = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('connected');
  
  // Try executing a short cmd command
  conn.exec('cmd /c echo test', (err, stream) => {
    if (err) { console.error('exec err:', err); conn.end(); return; }
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => {
      console.log('stream closed');
      setTimeout(() => conn.end(), 100);
    });
  });
}).on('error', e => console.error('conn err:', e.message)).connect({
  host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a',
  keepaliveInterval: 1000,
  keepaliveCountMax: 3
});
