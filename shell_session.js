const {Client} = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('shell ready');
  conn.shell((err, stream) => {
    if (err) { console.error('shell err:', err); conn.end(); return; }
    let out = '';
    stream.on('data', d => { process.stdout.write(d); out += d; });
    stream.on('close', () => { console.log('shell closed'); conn.end(); });
    
    // Wait a bit then send commands
    setTimeout(() => {
      stream.write('cd /d C:\\Users\\fo3nix && dir\r');
      setTimeout(() => stream.write('exit\r'), 2000);
    }, 500);
  });
}).on('error', e => console.error('conn err:', e.message)).connect({
  host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a'
});
