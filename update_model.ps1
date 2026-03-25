$c = Get-Content 'C:\Users\y2k1\.openclaw\openclaw.json' -Raw | ConvertFrom-Json
$m27 = @{
    id = 'MiniMax-M2.7-highspeed'
    name = 'MiniMax M2.7 Highspeed'
    input = @('text')
    cost = @{input=15;output=60;cacheRead=2;cacheWrite=10}
    contextWindow = 200000
    maxTokens = 8192
    reasoning = $false
}
$c.models.providers.minimax.models += $m27
$c.agents.defaults.model.primary = 'minimax/MiniMax-M2.7-highspeed'
$c | ConvertTo-Json -Depth 10 | Set-Content 'C:\Users\y2k1\.openclaw\openclaw.json' -Encoding UTF8
Write-Host 'done'
