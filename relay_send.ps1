$json = '{"sender":"xinghuo","target":"huohuo","topic":"create_ip_txt","content":"火火，请在你电脑上用PowerShell执行：Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like ''192.168.*''} | Select-Object -ExpandProperty IPAddress | Out-File -FilePath C:\ip.txt -Encoding utf8。然后回复我是否成功。"}'

$response = Invoke-RestMethod -Uri 'http://127.0.0.1:18080/relay' -Method Post -ContentType 'application/json' -Body $json
Write-Output $response
