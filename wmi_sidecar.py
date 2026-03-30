import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Kill anything on 18081
    stdin, stdout, stderr = client.exec_command(
        r'powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"'
    )
    stdout.read(); stderr.read()
    
    # Use WMI to create a truly detached process
    cmd = (
        r'powershell -Command "'
        r'$si = New-Object System.Management.ManagementClass(\'Win32_ProcessStartup\'); '
        r'$si.Properties[\'CreateFlags\'].Value = 0x00000008; '
        r'$p = Invoke-WmiMethod -Class Win32_Process -Name Create '
        r'-ArgumentList @(\'cmd /c start /b node C:\Users\fo3nix\relay_sidecar.js >> C:\Users\fo3nix\relay_sidecar.log 2>&1\', '
        r'\'C:\Users\fo3nix\', $null, $si); '
        r'Write-Host \'PID:\' $p.ProcessId"'
    )
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('gbk', errors='replace')
    print('WMI start:', out.strip())
    
    time.sleep(4)
    
    # Check port
    stdin2, stdout2, stderr2 = client.exec_command(
        r'powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue"'
    )
    out2 = stdout2.read().decode('gbk', errors='replace')
    print('Port 18081:', out2.strip() or 'NOT LISTENING')
    
    client.close()
    print('Done')
except Exception as e:
    print('Error:', e)
