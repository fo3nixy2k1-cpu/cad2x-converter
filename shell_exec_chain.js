const {Client} = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.shell({term:'vt100', cols:200, rows:40}, (err, stream) => {
    if (err) { console.error('shell err:', err); conn.end(); return; }
    let buf = '';
    let step = 0;
    stream.on('data', d => { 
      process.stdout.write(d.toString()); 
      buf += d.toString(); 
    });
    stream.on('close', () => { console.log('shell closed'); conn.end(); });
    
    const steps = [
      { delay: 800, cmd: 'powershell -Command "Select-String C:\\Users\\fo3nix\\.openclaw\\openclaw.json -Pattern token"\r' },
      { delay: 4000, cmd: 'exit\r' }
    ];
    
    const run = () => {
      if (step >= steps.length) return;
      const s = steps[step++];
      setTimeout(() => { 
        stream.write(s.cmd); 
        run(); 
      }, s.delay);
    };
    setTimeout(run, 500);
  });
}).on('error', e => console.error('conn err:', e.message)).connect({
  host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a'
});
