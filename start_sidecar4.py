import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Start sidecar using PowerShell Start-Process which creates a truly detached process
    cmd = 'powershell -Command "Start-Process -FilePath node -ArgumentList \\"C:\\Users\\fo3nix\\relay_sidecar.js\\" -WorkingDirectory \\"C:\\Users\\fo3nix\\" -WindowStyle Hidden -PassThru | Select-Object Id"'
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('gbk', errors='replace')
    print('Started with PID:', out.strip())
    
    time.sleep(3)
    
    # Check it's running
    stdin2, stdout2, stderr2 = client.exec_command('powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue"')
    out2 = stdout2.read().decode('gbk', errors='replace')
    print('Port check:', out2.strip() or 'NOT LISTENING')
    
    # Also check process
    stdin3, stdout3, stderr3 = client.exec_command('powershell -Command "Get-Process node | Format-Table Id, WorkingSet -AutoSize"')
    out3 = stdout3.read().decode('gbk', errors='replace')
    print('Node procs:', out3)
    
    client.close()
    print('Disconnected')
except Exception as e:
    print('Error:', e)
