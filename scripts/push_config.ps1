$content = Get-Content 'C:\Users\y2k1\.openclaw\workspace\scripts\203_new_config.json' -Raw
$b64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))

$scriptBlock = {
    param($b64Data)
    $decoded = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($b64Data))
    $decoded | Out-File -FilePath '/home/y2k1/.openclaw/openclaw.json' -NoNewline -Encoding UTF8
    Get-Content '/home/y2k1/.openclaw/openclaw.json'
}

try {
    $session = New-PSSession -HostName 192.168.10.203 -UserName y2k1 -ErrorAction Stop
    Invoke-Command -Session $session -ScriptBlock $scriptBlock -ArgumentList $b64
    Remove-PSSession $session
} catch {
    Write-Host "SSH connection failed: $_"
    # Fallback: show what we'd write
    Write-Host "Would write:"
    [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($b64))
}
