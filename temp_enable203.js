const {Client} = require('ssh2');

const c = new Client();
c.on('ready', () => {
  // First check current config
  c.exec('python3 -c "import json; d=json.load(open(\'/home/y2k1/.openclaw/openclaw.json\')); print(json.dumps(d.get(\'gateway\',{}).get(\'http\',{}).get(\'endpoints\',{})))"', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => {
      console.log('Current endpoints:', out.trim());
      // Add responses enabled
      c.exec('python3 -c "import json; d=json.load(open(\'/home/y2k1/.openclaw/openclaw.json\')); d.setdefault(\'gateway\',{}).setdefault(\'http\',{}).setdefault(\'endpoints\',{}); d[\'gateway\'][\'http\'][\'endpoints\'][\'responses\']={\"enabled\":True}; open(\'/home/y2k1/.openclaw/openclaw.json\',\'w\').write(json.dumps(d))"', (err2, stream2) => {
        let out2 = '';
        stream2.on('data', d => out2 += d);
        stream2.on('end', () => {
          console.log('Config updated');
          // Restart gateway
          c.exec('systemctl --user restart openclaw-gateway', (err3, stream3) => {
            let out3 = '';
            stream3.on('data', d => out3 += d);
            stream3.on('end', () => {
              console.log('Gateway restarted');
              // Start sidecar
              c.exec('cd /home/y2k1 && nohup node relay_sidecar.js > relay_sidecar.log 2>&1 & sleep 2 && ps aux | grep relay_sidecar | grep -v grep', (err4, stream4) => {
                let out4 = '';
                stream4.on('data', d => out4 += d);
                stream4.on('end', () => {
                  console.log(out4 || 'Sidecar may have started');
                  c.end();
                });
              });
            });
          });
        });
      });
    });
  });
}).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
