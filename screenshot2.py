import subprocess
import time

# Bring x64dbg to foreground and screenshot
script = '''
$x64dbg = Get-Process -Name x64dbg -ErrorAction SilentlyContinue
if ($x64dbg) {
    $hwnd = $x64dbg.MainWindowHandle
    if ($hwnd) {
        [void][System.Runtime.InteropServices.Marshal]::ShowWindow($hwnd, 9)
    }
}
Start-Sleep -Milliseconds 800
Add-Type -AssemblyName System.Windows.Forms
$bmp = New-Object System.Drawing.Bitmap(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen(0, 0, 0, 0, (New-Object System.Drawing.Size(1920, 1080)))
$bmp.Save("C:\\Users\\y2k1\\Downloads\\x64dbg_screen.png")
$g.Dispose()
$bmp.Dispose()
Write-Host "Screenshot saved"
'''

result = subprocess.run(['powershell', '-Command', script], capture_output=True, text=True)
print(result.stdout)
print(result.stderr)
