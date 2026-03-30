try {
    $r = Invoke-WebRequest -Uri 'http://192.168.10.201:18789/' -TimeoutSec 3 -UseBasicParsing
    Write-Host "Status:" $r.StatusCode
} catch {
    Write-Host "Error:" $_.Exception.Message
}
