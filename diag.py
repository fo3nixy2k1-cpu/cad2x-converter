import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Check all node processes
    stdin, stdout, stderr = client.exec_command('powershell -Command "Get-Process node | Format-Table Id, WorkingSet, CommandLine -AutoSize -Wrap"')
    out = stdout.read().decode('gbk', errors='replace')
    print('Node processes:', out)
    
    # Check port 18081
    stdin2, stdout2, stderr2 = client.exec_command('powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue"')
    out2 = stdout2.read().decode('gbk', errors='replace')
    print('Port 18081:', out2)
    
    # Try a simple curl to the sidecar
    stdin3, stdout3, stderr3 = client.exec_command('cmd /c curl -s http://127.0.0.1:18081/')
    out3 = stdout3.read().decode('gbk', errors='replace')
    print('Curl result:', out3 or 'empty')
    
    client.close()
except Exception as e:
    print('Error:', e)
