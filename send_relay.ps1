$body = '{"sender":"xinghuo","target":"qiming","topic":"askagain","content":"203，你在吗？测试一下能否回复我。"}'
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:18080/relay' -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 5
    Write-Host "OK:" $r.StatusCode
} catch {
    Write-Host "FAIL:" $_.Exception.Message
}
