import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Send a result message as if huohuo sidecar is replying
    test_script = '''
const http = require('http');
const msg = JSON.stringify({
  sender: 'huohuo',
  topic: 'test_result_endpoint',
  content: 'Hello from huohuo sidecar!'
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
  res.on('end', () => {
    console.log('RESULT STATUS:' + res.statusCode);
    console.log('RESULT BODY:' + d.substring(0, 200));
    // Also try to read any pending messages from the Hub
    setTimeout(() => { process.exit(0); }, 1000);
  });
});
req.on('error', e => { console.error('ERR:' + e.message); process.exit(1); });
req.write(msg);
req.end();
console.log('Sent result');
'''
    sftp = client.open_sftp()
    fl = sftp.file('C:/Users/fo3nix/test_result_ep.js', 'w')
    fl.write(test_script)
    fl.close()
    sftp.close()
    
    stdin, stdout, stderr = client.exec_command('cmd /c node C:\\Users\\fo3nix\\test_result_ep.js')
    out = stdout.channel.recv(4096).decode('utf-8', errors='replace')
    err = stderr.channel.recv(1024).decode('utf-8', errors='replace')
    print('STDOUT:', out[:300])
    print('STDERR:', err[:200])
    
    client.close()
except Exception as e:
    print('Error:', e)
