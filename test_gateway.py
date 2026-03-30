import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    
    # Test if 201 can reach 195:18080
    cmd = 'powershell -Command "try { (Invoke-WebRequest -Uri http://192.168.10.195:18080/health -TimeoutSec 5 -UseBasicParsing).StatusCode } catch { Write-Host ERR }"'
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('gbk', errors='replace')
    print('195:18080 reachable:', out.strip() or 'ERR')
    
    # Test gateway at 18789
    stdin2, stdout2, stderr2 = client.exec_command('cmd /c curl -s http://127.0.0.1:18789/v1/models')
    out2 = stdout2.read().decode('utf-8', errors='replace')
    print('Gateway /v1/models:', out2[:300] if out2 else 'empty')
    
    client.close()
except Exception as e:
    print('Error:', e)
