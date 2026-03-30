const {Client} = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) { console.error('sftp err:', err); conn.end(); return; }
    // Try different path formats
    const paths = [
      'C:/Users/fo3nix/.openclaw/openclaw.json',
      '/cygdrive/c/Users/fo3nix/.openclaw/openclaw.json',
      '//c/Users/fo3nix/.openclaw/openclaw.json'
    ];
    const tryPath = (i) => {
      if (i >= paths.length) { console.log('all paths failed'); conn.end(); return; }
      sftp.readFile(paths[i], 'utf8', (err, data) => {
        if (err) { console.log('path', i, 'failed:', err.message); tryPath(i+1); }
        else { console.log('path', i, 'success:\n', data); conn.end(); }
      });
    };
    tryPath(0);
  });
}).on('error', e => console.error('conn err:', e.message)).connect({
  host:'192.168.10.201', port:22, username:'fo3nix', password:'Testonly.3a'
});
