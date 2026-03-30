import paramiko
import json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Test /result endpoint
    test_script = '''
const http = require('http');
const msg = JSON.stringify({
  sender: 'huohuo',
  topic: 'test_alive_v3',
  content: 'I am alive!'
});
const req = http.request({
  hostname: '192.168.10.195',
  port: 18080,
  path: '/result',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(msg)
  }
}, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => { console.log('RESULT STATUS:' + res.statusCode); console.log('RESULT BODY:' + d.substring(0, 300)); });
});
req.on('error', e => console.error('RESULT ERR:' + e.message));
req.write(msg);
req.end();
'''
    sftp = client.open_sftp()
    fl = sftp.file('C:/Users/fo3nix/test_result.js', 'w')
    fl.write(test_script)
    fl.close()
    sftp.close()
    
    stdin, stdout, stderr = client.exec_command('cmd /c node C:\\Users\\fo3nix\\test_result.js')
    out_bytes = stdout.channel.recv(4096)
    out = out_bytes.decode('utf-8', errors='replace')
    err_bytes = stderr.channel.recv(1024)
    err = err_bytes.decode('utf-8', errors='replace')
    print('STDOUT:', out[:500])
    print('STDERR:', err[:200])
    
    client.close()
except Exception as e:
    print('Error:', e)
