const fs = require('fs');
const {Client} = require('ssh2');

const SSH = { host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357', timeout: 15000 };

const conn = new Client();
conn.on('ready', () => {
  conn.exec('find /home/y2k1/.openclaw/workspace -name "*.md" 2>/dev/null | head -20; echo "==="; find /home/y2k1 -name "memory" -type d 2>/dev/null | head -10; echo "==="; ls /home/y2k1/.openclaw/workspace/memory/ 2>/dev/null || echo "no workspace/memory"', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => { console.log(out); conn.end(); });
  });
}).on('error', e => console.error('Connection error:', e.message)).connect(SSH);
