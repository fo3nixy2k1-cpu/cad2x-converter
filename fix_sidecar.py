import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Read log
    stdin, stdout, stderr = client.exec_command('cmd /c type "C:\\Users\\fo3nix\\relay_sidecar.log"')
    out = stdout.read().decode('gbk', errors='replace')
    print('Log:', repr(out))
    
    # Check process
    stdin2, stdout2, stderr2 = client.exec_command('powershell -Command "Get-Process -Id 11860 -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, WorkingSet"')
    out2 = stdout2.read().decode('gbk', errors='replace')
    print('Process:', out2 or 'not running')
    
    # Try to start manually with output
    stdin3, stdout3, stderr3 = client.exec_command('powershell -Command "cd C:\\Users\\fo3nix; node relay_sidecar.js 2>&1 | Select-Object -First 5"')
    out3 = stdout3.read().decode('gbk', errors='replace')
    err3 = stderr3.read().decode('gbk', errors='replace')
    print('Manual start output:', out3 or 'empty', err3 or 'empty')
    
    client.close()
except Exception as e:
    print('Error:', e)
