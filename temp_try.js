const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('echo ok', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => { console.log('1351: ok'); c.end(); });
  });
}).on('error', e => console.log('1351 Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1351' });
