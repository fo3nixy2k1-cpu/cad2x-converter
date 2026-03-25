$action = New-ScheduledTaskAction -Execute 'node.exe' -Argument 'C:\Users\y2k1\.openclaw\workspace\skills\huohuo-bridge\service.js' -WorkingDirectory 'C:\Users\y2k1\.openclaw\workspace\skills\huohuo-bridge'
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName 'HuohuoBridge' -Action $action -Trigger $trigger -Description '星火与火火通信服务' -Force
