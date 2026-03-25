const fs = require('fs');
const {Client} = require('ssh2');

const SSH = { host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357', timeout: 15000 };

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) { console.error('SFTP error:', err); conn.end(); return; }
    // Write probe script
    sftp.writeFile('/home/y2k1/probe2.py', fs.readFileSync('C:/Users/y2k1/.openclaw/workspace/probe_schema.py', 'utf8'), (err2) => {
      // Check memory dir structure
      conn.exec('find /home/y2k1/.openclaw/memory/ -type f 2>&1 | head -30', (err3, stream3) => {
        let out = '';
        stream3.on('data', d => out += d);
        stream3.on('close', () => {
          console.log('memory files:', out);
          // Also check meta table
          conn.exec('/usr/bin/python3 -c "import sqlite3; conn=sqlite3.connect(\'/home/y2k1/.openclaw/memory/main.sqlite\'); cur=conn.cursor(); cur.execute(\\'SELECT * FROM meta\\'); print(cur.fetchall()); conn.close()"', (err4, stream4) => {
            let out4 = '';
            stream4.on('data', d => out4 += d);
            stream4.on('close', () => { console.log('meta:', out4); conn.end(); });
          });
        });
      });
    });
  });
}).on('error', e => console.error('Connection error:', e.message)).connect(SSH);
