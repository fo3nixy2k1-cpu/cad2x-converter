const {Client} = require('ssh2');

const c = new Client();
c.on('ready', () => {
  // Use node on 203 to properly update the JSON config
  const js = `node -e "
const fs = require('fs');
const d = JSON.parse(fs.readFileSync('/home/y2k1/.openclaw/openclaw.json', 'utf8'));
d.gateway = d.gateway || {};
d.gateway.http = d.gateway.http || {};
d.gateway.http.endpoints = d.gateway.http.endpoints || {};
d.gateway.http.endpoints.responses = {enabled: true};
fs.writeFileSync('/home/y2k1/.openclaw/openclaw.json', JSON.stringify(d, null, 2));
console.log('Done');
"`;
  c.exec(js, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => {
      console.log(out);
      // Restart gateway
      c.exec('systemctl --user restart openclaw-gateway', (err2, stream2) => {
        let out2 = '';
        stream2.on('data', d => out2 += d);
        stream2.on('end', () => {
          console.log('Restarted');
          setTimeout(() => {
            // Test
            c.exec("curl -s -X POST http://127.0.0.1:18789/v1/responses -H 'Authorization: Bearer sk-b669c76c4ec27a7b8d2892303063873b' -H 'Content-Type: application/json' -d '{\"model\":\"openclaw\",\"input\":\"test\",\"stream\":false}' | head -c 100", (err3, stream3) => {
              let out3 = '';
              stream3.on('data', d => out3 += d);
              stream3.on('end', () => { console.log('Test result:', out3.substring(0, 80)); c.end(); });
            });
          }, 5000);
        });
      });
    });
  });
}).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
