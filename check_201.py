import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    stdin, stdout, stderr = client.exec_command('powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue"')
    out = stdout.read().decode('gbk', errors='replace')
    print('Port 18081:', out.strip() or 'NOT LISTENING')
    
    stdin2, stdout2, stderr2 = client.exec_command('cmd /c type "C:\\Users\\fo3nix\\relay_sidecar.log"')
    out2 = stdout2.read().decode('gbk', errors='replace')
    print('Log:', repr(out2 or 'empty'))
    
    client.close()
except Exception as e:
    print('Error:', e)
