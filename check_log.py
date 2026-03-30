import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Read log
    stdin, stdout, stderr = client.exec_command('cmd /c type "C:\\Users\\fo3nix\\relay_sidecar.log"')
    out = stdout.read().decode('gbk', errors='replace')
    print('Log:', repr(out))
    
    client.close()
except Exception as e:
    print('Error:', e)
