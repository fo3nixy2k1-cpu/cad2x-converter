# Gateway Health Monitor
# 每分钟执行一次，记录网关健康状态，卡死之后可以回溯

$GatewayPort = 28789
$LogFile = "C:\Users\y2k1\.openclaw\workspace\gateway_health.log"
$Now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# 获取 gateway 进程信息
$gatewayPid = (Get-NetTCPConnection -LocalPort $GatewayPort -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess
$gatewayProc = Get-Process -Id $gatewayPid -ErrorAction SilentlyContinue
$nodeCount = (Get-Process node -ErrorAction SilentlyContinue).Count
$chromeCount = (Get-Process chrome -ErrorAction SilentlyContinue).Count

# 连接统计
$established = (Get-NetTCPConnection -LocalPort $GatewayPort -State Established -ErrorAction SilentlyContinue).Count
$timeWait = (Get-NetTCPConnection -LocalPort $GatewayPort -State TimeWait -ErrorAction SilentlyContinue).Count
$closeWait = (Get-NetTCPConnection -LocalPort $GatewayPort -State CloseWait -ErrorAction SilentlyContinue).Count
$finWait2 = (Get-NetTCPConnection -LocalPort $GatewayPort -State FinWait2 -ErrorAction SilentlyContinue).Count
$listen = (Get-NetTCPConnection -LocalPort $GatewayPort -State Listen -ErrorAction SilentlyContinue).Count

# Gateway 内存
$gwMemMB = if ($gatewayProc) { [math]::Round($gatewayProc.WorkingSet64 / 1MB, 1) } else { "N/A" }
$gwThreads = if ($gatewayProc) { $gatewayProc.Threads.Count } else { "N/A" }
$gwHandles = if ($gatewayProc) { $gatewayProc.HandleCount } else { "N/A" }

$logEntry = "$Now | ESTABLISHED=$established | TIME_WAIT=$timeWait | CLOSE_WAIT=$closeWait | FIN_WAIT2=$finWait2 | LISTEN=$listen | Chrome=$chromeCount | Node=$nodeCount | GwMem=${gwMemMB}MB | GwThreads=$gwThreads | GwHandles=$gwHandles"

Add-Content -Path $LogFile -Value $logEntry
Write-Host $logEntry
