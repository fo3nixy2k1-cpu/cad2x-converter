import paramiko
import json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Write a test script that sends to sidecar
    test_script = '''
const http = require('http');
const msg = JSON.stringify({
  sender: 'xinghuo',
  topic: 'direct_test',
  content: 'hello from direct test'
});
const req = http.request({
  hostname: '127.0.0.1',
  port: 18081,
  path: '/webhook/agent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(msg)
  }
}, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => { console.log('SIDELET STATUS:' + res.statusCode); console.log('SIDELET BODY:' + d.substring(0, 300)); });
});
req.on('error', e => console.error('SIDELET ERR:' + e.message));
req.write(msg);
req.end();
'''
    sftp = client.open_sftp()
    fl = sftp.file('C:/Users/fo3nix/test_sidecar.js', 'w')
    fl.write(test_script)
    fl.close()
    sftp.close()
    
    # Run it
    stdin, stdout, stderr = client.exec_command('cmd /c node C:\\Users\\fo3nix\\test_sidecar.js')
    out_bytes = stdout.channel.recv(4096)
    out = out_bytes.decode('utf-8', errors='replace')
    err_bytes = stderr.channel.recv(1024)
    err = err_bytes.decode('utf-8', errors='replace')
    print('STDOUT:', out[:500])
    print('STDERR:', err[:200])
    
    # Read log
    stdin2, stdout2, stderr2 = client.exec_command('cmd /c type "C:\\Users\\fo3nix\\relay_sidecar.log"')
    out2 = stdout2.read().decode('gbk', errors='replace')
    print('LOG:', repr(out2))
    
    client.close()
except Exception as e:
    print('Error:', e)
