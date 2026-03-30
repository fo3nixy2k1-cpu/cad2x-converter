import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Kill existing sidecar processes by port
    stdin, stdout, stderr = client.exec_command('powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"')
    stdout.read()
    stderr.read()
    print('Killed existing on 18081')
    
    # Start sidecar with cmd /b background - redirect output to file
    stdin, stdout, stderr = client.exec_command(
        'cmd /c "cd /d C:\\Users\\fo3nix && start /b cmd /c \"node relay_sidecar.js >> relay_sidecar.log 2>&1\""'
    )
    stdout.read()
    stderr.read()
    print('Started via cmd /b')
    
    time.sleep(4)
    
    # Check log
    stdin2, stdout2, stderr2 = client.exec_command('cmd /c type "C:\\Users\\fo3nix\\relay_sidecar.log"')
    out2 = stdout2.read().decode('gbk', errors='replace')
    print('Log:', repr(out2))
    
    # Check port
    stdin3, stdout3, stderr3 = client.exec_command('powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue"')
    out3 = stdout3.read().decode('gbk', errors='replace')
    print('Port 18081:', out3.strip() or 'NOT LISTENING')
    
    client.close()
except Exception as e:
    print('Error:', e)
