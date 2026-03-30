import paramiko
import json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Write a node test script
    test_script = '''
const http = require('http');
const data = JSON.stringify({model:'openclaw',input:'hello',stream:false});
const req = http.request({
  hostname: '127.0.0.1',
  port: 18789,
  path: '/v1/responses',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer af83d54dae9fd044ced5005f1cbdfb00b7636317c3143a73',
    'Content-Type': 'application/json',
    'x-openclaw-agent-id': 'main',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => { console.log('STATUS:' + res.statusCode); console.log('BODY:' + d.substring(0, 300)); });
});
req.on('error', e => console.error('ERR:' + e.message));
req.write(data);
req.end();
'''
    sftp = client.open_sftp()
    fl = sftp.file('C:/Users/fo3nix/test_gw.js', 'w')
    fl.write(test_script)
    fl.close()
    sftp.close()
    print('Script written')
    
    # Run it
    stdin, stdout, stderr = client.exec_command('cmd /c node C:\\Users\\fo3nix\\test_gw.js')
    out_bytes = stdout.channel.recv(4096)
    out = out_bytes.decode('utf-8', errors='replace')
    err_bytes = stderr.channel.recv(1024)
    err = err_bytes.decode('utf-8', errors='replace')
    print('STDOUT:', out[:500])
    print('STDERR:', err[:200])
    
    client.close()
except Exception as e:
    print('Error:', e)
