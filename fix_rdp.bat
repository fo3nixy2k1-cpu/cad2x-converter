reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v DisableHardwareAcceleration /t REG_DWORD /d 1 /f
gpupdate /force
pause