import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Test full sidecar -> gateway -> process -> reply to Hub flow
    test_script = '''
const http = require('http');
const msg = JSON.stringify({
  sender: 'xinghuo',
  topic: 'direct_reply_test',
  content: 'direct test to sidecar'
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
  res.on('end', () => {
    console.log('SIDECAR STATUS:' + res.statusCode);
    // Give time for the async reply to be sent
    setTimeout(() => {
      console.log('Done waiting for reply');
    }, 5000);
  });
});
req.on('error', e => console.error('ERR:' + e.message));
req.write(msg);
req.end();
console.log('Sent to sidecar');
'''
    sftp = client.open_sftp()
    fl = sftp.file('C:/Users/fo3nix/test_sidecar_full.js', 'w')
    fl.write(test_script)
    fl.close()
    sftp.close()
    
    stdin, stdout, stderr = client.exec_command('cmd /c node C:\\Users\\fo3nix\\test_sidecar_full.js')
    # Give it 10 seconds for the full flow
    client.exec_command('timeout /t 8 /nobreak >nul')
    
    # Check if Hub received any result
    # Actually we just need to verify the sidecar processed and replied
    out = stdout.channel.recv(8192).decode('utf-8', errors='replace')
    err = stderr.channel.recv(4096).decode('utf-8', errors='replace')
    print('STDOUT:', out[:500])
    print('STDERR:', err[:200])
    
    client.close()
except Exception as e:
    print('Error:', e)
