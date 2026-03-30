const {Client} = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) { console.error('sftp err:', err); conn.end(); return; }
    // Try reading with forward slashes
    sftp.readFile('/Users/fo3nix/.openclaw/openclaw.json', 'utf8', (err, data) => {
      if (err) {
        console.error('try1 err:', err.message);
        // Try Windows backslashes
        sftp.readFile('C:\\Users\\fo3nix\\.openclaw\\openclaw.json', 'utf8', (err2, data2) => {
          if (err2) { console.error('try2 err:', err2.message); conn.end(); return; }
          console.log(data2);
          conn.end();
        });
        return;
      }
      console.log(data);
      conn.end();
    });
  });
}).on('error', e => console.error('conn err:', e.message)).connect({
  host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a'
});
