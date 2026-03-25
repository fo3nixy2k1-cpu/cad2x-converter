import winreg
import sys

try:
    key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r'SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon', 0, winreg.KEY_SET_VALUE)
    winreg.SetValueEx(key, 'AutoAdminLogon', 0, winreg.REG_SZ, '1')
    winreg.SetValueEx(key, 'DefaultUserName', 0, winreg.REG_SZ, 'y2k1')
    winreg.SetValueEx(key, 'DefaultPassword', 0, winreg.REG_SZ, 'Testonly.3a')
    winreg.CloseKey(key)
    print('OK')
except Exception as e:
    print(f'Error: {e}')
