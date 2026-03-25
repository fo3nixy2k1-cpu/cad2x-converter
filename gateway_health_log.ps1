$t = '2026-03-24 02:50:54'
$l = 'C:\Users\y2k1\.openclaw\workspace\gateway_health.log'
$s = 'ESTABLISHED=0 | TIME_WAIT=0 | CLOSE_WAIT=0 | FIN_WAIT2=0 | Chrome=7 | Node=3 | GwHandles=379 | GwMem=715MB | GwPID=7008 | GwAlive=OK'
$c = "$t | $s`r`n"
$f = Get-Content $l -Raw -EA SilentlyContinue
if ($f) { $c = $f + $c }
[System.IO.File]::WriteAllText($l, $c)
Write-Host 'Logged'
