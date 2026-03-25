const {Client} = require('ssh2');

const SSH = {
  host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357', timeout: 10000
};

// Python script to read memory from SQLite
const PYTHON_SCRIPT = `
import sqlite3, os, json
from datetime import datetime, timedelta

db_path = os.path.expanduser('~/.openclaw/memory/main.sqlite')
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Get entries from last 7 days
seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S')
cur.execute(
    "SELECT created_at, content FROM memory_entries WHERE created_at >= ? ORDER BY created_at DESC LIMIT 50",
    (seven_days_ago,)
)
rows = cur.fetchall()
conn.close()

for r in rows:
    print(f"[{r[0]}] {r[1][:300]}")
`.replace(/\n/g, '; ');

const CRON_LINE = `0 9 * * 0 cd /home/y2k1 && python3 -c "${PYTHON_SCRIPT}" >> /home/y2k1/.openclaw/logs/weekly_memory.log 2>&1`;

const conn = new Client();
conn.on('ready', () => {
  // First check existing crontab
  conn.exec('crontab -l 2>/dev/null; echo "---CRONEND---"', (err, stream) => {
    if (err) { console.error('exec err:', err); conn.end(); return; }
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Existing crontab:\n' + out);
      
      // Remove any existing weekly-memory line and add new one
      const existingLines = out.split('\n').filter(l => !l.includes('weekly-memory') && l.trim());
      existingLines.push(CRON_LINE);
      const newCrontab = existingLines.join('\n') + '\n';
      
      // Write new crontab via heredoc
      const writeCmd = `printf '%s\\n' "${existingLines.join('\\n')}" | crontab -`;
      conn.exec(writeCmd, (err2, stream2) => {
        if (err2) { console.error('write err:', err2); conn.end(); return; }
        let out2 = '';
        stream2.on('data', d => out2 += d);
        stream2.stderr.on('data', d => out2 += 'STDERR:' + d);
        stream2.on('close', () => {
          console.log('Write result:', out2);
          // Verify
          conn.exec('crontab -l', (err3, stream3) => {
            if (err3) { conn.end(); return; }
            let out3 = '';
            stream3.on('data', d => out3 += d);
            stream3.on('close', () => {
              console.log('New crontab:\n' + out3);
              conn.end();
            });
          });
        });
      });
    });
  });
}).on('error', e => console.error('conn err:', e.message)).connect(SSH);
