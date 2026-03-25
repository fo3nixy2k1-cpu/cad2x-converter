$body = '{"sender":"xinghuo","target":"qiming","topic":"ping_test","content":"ping"}'
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:18080/relay' -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 5
    Write-Host "HTTP" $r.StatusCode "-" $r.Content
} catch {
    Write-Host "FAIL:" $_.Exception.Message
}
