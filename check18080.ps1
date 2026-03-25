Get-NetTCPConnection -LocalPort 18080 -ErrorAction SilentlyContinue
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne 7308 -and $_.Id -ne 6428 }
