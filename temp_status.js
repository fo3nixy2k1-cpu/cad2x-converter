const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('echo "=== 时间 ===" && date && echo "" && echo "=== Relay进程 ===" && ps aux | grep relay | grep -v grep && echo "" && echo "=== 负载 ===" && uptime && echo "" && echo "=== 内存 ===" && free -h', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('end', () => { console.log(out); c.end(); });
  });
}).on('error', e => console.log('Error:', e.message)).connect({ host: '192.168.10.203', port: 22, username: 'y2k1', password: 'Qpzm1357' });
