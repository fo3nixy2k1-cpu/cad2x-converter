const {Client} = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('/usr/bin/python3 -c "import sqlite3; conn=sqlite3.connect(\'/home/y2k1/.openclaw/memory/main.sqlite\'); cur=conn.cursor(); cur.execute(\"SELECT name FROM sqlite_master WHERE type=\\'table\\'\"); print([r[0] for r in cur.fetchall()]); conn.close()"', (err, stream) => {
    if (err) { console.error('exec err:', err); conn.end(); return; }
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => { console.log(out); conn.end(); });
  });
}).on('error', e => console.error('conn err:', e.message)).connect({
  host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357', timeout: 10000
});
