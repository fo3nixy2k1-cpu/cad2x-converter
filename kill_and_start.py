import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Kill anything on port 18081
    stdin, stdout, stderr = client.exec_command('powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"')
    stdout.read(); stderr.read()
    
    # Clear log
    sftp = client.open_sftp()
    fl = sftp.file('C:/Users/fo3nix/relay_sidecar.log', 'w')
    fl.write('')
    fl.close()
    sftp.close()
    
    # Start sidecar using PowerShell Start-Process with -NoNewWindow so it stays attached
    # Use -RedirectStandardOutput to a file
    cmd = 'powershell -Command "Start-Process -FilePath cmd -ArgumentList \\"/c cd /d C:\\Users\\fo3nix \\&\\& node relay_sidecar.js 2\\>\\&1 \\> relay_sidecar.log\\" -WindowStyle Hidden -PassThru | Select-Object Id"'
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('gbk', errors='replace')
    print('Start result:', out.strip())
    
    time.sleep(5)
    
    # Check process
    stdin2, stdout2, stderr2 = client.exec_command('powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue"')
    out2 = stdout2.read().decode('gbk', errors='replace')
    print('Port 18081:', out2.strip() or 'NOT LISTENING')
    
    # Read log
    stdin3, stdout3, stderr3 = client.exec_command('cmd /c type "C:\\Users\\fo3nix\\relay_sidecar.log"')
    out3 = stdout3.read().decode('gbk', errors='replace')
    print('Log:', repr(out3))
    
    client.close()
except Exception as e:
    print('Error:', e)
