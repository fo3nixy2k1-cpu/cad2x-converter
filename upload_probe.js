const fs = require('fs');
const {Client} = require('ssh2');

const SSH = { host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357', timeout: 15000 };

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) { console.error('SFTP error:', err); conn.end(); return; }
    sftp.writeFile('/home/y2k1/probe.py', fs.readFileSync('C:/Users/y2k1/.openclaw/workspace/probe_schema.py', 'utf8'), (err2) => {
      if (err2) { console.error('Write error:', err2); conn.end(); return; }
      conn.exec('/usr/bin/python3 /home/y2k1/probe.py 2>&1', (err3, stream3) => {
        let out = '';
        stream3.on('data', d => out += d);
        stream3.on('close', () => { console.log(out); conn.end(); });
      });
    });
  });
}).on('error', e => console.error('Connection error:', e.message)).connect(SSH);
