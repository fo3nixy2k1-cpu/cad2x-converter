import sys
sys.path.insert(0, r'C:\Users\y2k1\AppData\Local\Programs\ClawX\resources\openclaw\tools')
import subprocess

# Take screenshot using PIL
subprocess.run([
    'powershell', '-Command',
    r'''
Add-Type -AssemblyName System.Windows.Forms
$bmp = New-Object System.Drawing.Bitmap(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen(0, 0, 0, 0, (New-Object System.Drawing.Size(1920, 1080)))
$bmp.Save("C:\Users\y2k1\Downloads\screenshot.png")
$g.Dispose()
$bmp.Dispose()
'''
], check=True)

print("Screenshot saved to C:\\Users\\y2k1\\Downloads\\screenshot.png")
