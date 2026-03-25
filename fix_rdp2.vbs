Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "reg add ""HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp"" /v ColorDepth /t REG_DWORD /d 6 /f", 0
WshShell.Run "reg add ""HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services"" /v DisableHardwareAcceleration /t REG_DWORD /d 1 /f", 0
WshShell.Run "gpupdate /force", 0, True
