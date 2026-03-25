const { Client } = require('ssh2');
const fs = require('fs');

const newConfig = JSON.stringify({
  models: { mode: 'merge', providers: {} },
  agents: { defaults: { model: { primary: null, fallbacks: [] } } },
  auth: { profiles: {} },
  channels: {
    qqbot: {
      enabled: true,
      appId: '1903601956',
      clientSecret: 'WLAzodTJ9zpfVMD4vmdUME6yqiaTMF81',
      allowFrom: ['*'],
      dmPolicy: 'open'
    }
  },
  gateway: {
    port: 18789,
    mode: 'local',
    bind: 'loopback',
    auth: { mode: 'token', token: 'sk-b669c76c4ec27a7b8d2892303063873b' }
  },
  plugins: { entries: { qqbot: { enabled: true } } }
}, null, 2);

// Write to temp file first
fs.writeFileSync('C:/Users/y2k1/.openclaw/workspace/scripts/203_new_config.json', newConfig);

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to 203');
  
  // Backup
  conn.exec('cp /home/y2k1/.openclaw/openclaw.json /home/y2k1/.openclaw/openclaw.json.bak.20260322', (err, stream) => {
    if (err) { console.error('Backup error:', err); conn.end(); return; }
    stream.on('close', () => {
      console.log('Backup done');
      
      // Read local new config and write via base64
      const content = fs.readFileSync('C:/Users/y2k1/.openclaw/workspace/scripts/203_new_config.json', 'utf8');
      const b64 = Buffer.from(content).toString('base64');
      
      const cmd = `echo '${b64}' | base64 -d > /home/y2k1/.openclaw/openclaw.json`;
      conn.exec(cmd, (err2, stream2) => {
        if (err2) { console.error('Write error:', err2); conn.end(); return; }
        let errOut = '';
        stream2.stderr.on('data', d => errOut += d);
        stream2.on('close', () => {
          if (errOut) console.error('stderr:', errOut);
          
          // Verify
          conn.exec('cat /home/y2k1/.openclaw/openclaw.json', (err3, stream3) => {
            let data = '';
            stream3.on('data', d => data += d);
            stream3.on('close', () => { 
              console.log('New config:', data); 
              conn.end(); 
            });
          });
        });
      });
    });
  });
}).on('error', err => {
  console.error('Connection error:', err);
}).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
