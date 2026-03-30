import paramiko

# Fixed sidecar - always sends reply back to Hub
js_script = (
    "const MY_ID = 'huohuo';\n"
    "const RELAY = 'http://192.168.10.195:18080/relay';\n"
    "const CLAW_URL = 'http://127.0.0.1:18789/v1/responses';\n"
    "const CLAW_TOKEN = 'af83d54dae9fd044ced5005f1cbdfb00b7636317c3143a73';\n"
    "\n"
    "const http = require('http');\n"
    "const server = http.createServer(async (req, res) => {\n"
    "  if (req.method === 'POST' && req.url === '/webhook/agent') {\n"
    "    let body = '';\n"
    "    req.on('data', d => body += d);\n"
    "    req.on('end', async () => {\n"
    "      const msg = JSON.parse(body);\n"
    "      console.log('[*] ' + MY_ID + ' got: ' + msg.content);\n"
    "\n"
    "      const clawBody = JSON.stringify({\n"
    "        model: 'openclaw',\n"
    "        input: msg.content,\n"
    "        stream: false\n"
    "      });\n"
    "\n"
    "      const clawReq = http.request({\n"
    "        hostname: '127.0.0.1',\n"
    "        port: 18789,\n"
    "        path: '/v1/responses',\n"
    "        method: 'POST',\n"
    "        headers: {\n"
    "          'Authorization': 'Bearer ' + CLAW_TOKEN,\n"
    "          'Content-Type': 'application/json',\n"
    "          'x-openclaw-agent-id': 'main',\n"
    "          'Content-Length': Buffer.byteLength(clawBody)\n"
    "        }\n"
    "      }, (clawRes) => {\n"
    "        let data = '';\n"
    "        clawRes.on('data', d => data += d);\n"
    "        clawRes.on('end', () => {\n"
    "          // Always send reply back to Hub\n"
    "          const result = JSON.parse(data);\n"
    "          const text = result.output?.[0]?.content?.[0]?.text || 'done';\n"
    "          const reply = JSON.stringify({\n"
    "            topic: msg.topic,\n"
    "            sender: MY_ID,\n"
    "            target: 'xinghuo',\n"
    "            content: text\n"
    "          });\n"
    "          const rp = http.request(RELAY, {method:'POST', headers:{'Content-Type':'application/json'}}, () => {});\n"
    "          rp.on('error', e => console.error('relay err:', e));\n"
    "          rp.write(reply);\n"
    "          rp.end();\n"
    "\n"
    "          res.writeHead(200);\n"
    "          res.end(JSON.stringify({ status: 'ok' }));\n"
    "        });\n"
    "      });\n"
    "      clawReq.on('error', e => { console.error('claw err:', e); res.writeHead(500); res.end(); });\n"
    "      clawReq.write(clawBody);\n"
    "      clawReq.end();\n"
    "    });\n"
    "    return;\n"
    "  }\n"
    "  res.writeHead(404);\n"
    "  res.end();\n"
    "});\n"
    "\n"
    "server.listen(18081, '0.0.0.0', () => console.log(MY_ID + ' sidecar running on :18081'));\n"
)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)
    sftp = client.open_sftp()
    
    fl = sftp.file('C:/Users/fo3nix/relay_sidecar.js', 'w')
    fl.write(js_script)
    fl.close()
    print('Fixed script uploaded')
    
    # Kill old sidecar
    stdin, stdout, stderr = client.exec_command(
        r'powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"'
    )
    stdout.read(); stderr.read()
    print('Killed old sidecar')
    
    # Start new one
    import time
    time.sleep(1)
    
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
    print('Started:', out.strip())
    
    time.sleep(3)
    
    stdin2, stdout2, stderr2 = client.exec_command(
        r'powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue"'
    )
    out2 = stdout2.read().decode('gbk', errors='replace')
    print('Port check:', out2.strip() or 'NOT LISTENING')
    
    sftp.close()
    client.close()
    print('Done')
except Exception as e:
    print('Error:', e)
