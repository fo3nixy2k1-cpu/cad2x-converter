import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    stdin, stdout, stderr = client.exec_command(r'powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue | Format-Table -AutoSize"')
    out = stdout.read().decode('gbk', errors='replace')
    print('18081:', out.strip() or 'NOT LISTENING')
    client.close()
except Exception as e:
    print('Error:', e)
