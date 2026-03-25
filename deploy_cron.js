const fs = require('fs');
const {Client} = require('ssh2');

const SSH = { host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357', timeout: 15000 };
const scriptPath = 'C:/Users/y2k1/.openclaw/workspace/weekly_memory.py';
const remoteScript = '/home/y2k1/.openclaw/weekly_memory.py';
const cronLine = '0 9 * * 0 /usr/bin/python3 /home/y2k1/.openclaw/weekly_memory.py >> /home/y2k1/.openclaw/logs/weekly_memory.log 2>&1';

const script = fs.readFileSync(scriptPath, 'utf8');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) { console.error('SFTP error:', err); conn.end(); return; }
    sftp.writeFile(remoteScript, script, (err2) => {
      if (err2) { console.error('Write file error:', err2); conn.end(); return; }
      console.log('Script uploaded to', remoteScript);
      
      conn.exec('chmod +x ' + remoteScript, (err3, stream3) => {
        let out3 = '';
        stream3.on('data', d => out3 += d);
        stream3.on('close', () => {
          console.log('chmod done:', out3.trim());
          
          // Test run
          conn.exec('/usr/bin/python3 ' + remoteScript + ' 2>&1', (err4, stream4) => {
            let out4 = '';
            stream4.on('data', d => out4 += d);
            stream4.on('close', (code) => {
              console.log('Test run exit code:', code);
              console.log('Test output:', out4.substring(0, 500));
              
              // Set crontab
              const cmd = '(crontab -l 2>/dev/null | grep -v weekly_memory; echo "' + cronLine + '") | crontab -';
              conn.exec(cmd, (err5, stream5) => {
                let out5 = '';
                stream5.on('data', d => out5 += d);
                stream5.stderr.on('data', d => out5 += d);
                stream5.on('close', () => {
                  console.log('crontab set');
                  conn.exec('crontab -l', (err6, stream6) => {
                    let out6 = '';
                    stream6.on('data', d => out6 += d);
                    stream6.on('close', () => {
                      console.log('=== Final crontab ===\n' + out6);
                      conn.end();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}).on('error', e => console.error('Connection error:', e.message)).connect(SSH);
