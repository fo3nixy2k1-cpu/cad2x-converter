from pywinauto import Application
from pywinauto.keyboard import send_keys
import time

# Connect to x64dbg
app = Application(backend='win32').connect(process=10936)
print('Connected to x64dbg')

# Find the main window and set focus
dlg = app['x64dbg']
dlg.set_focus()
time.sleep(0.5)

# Use Alt+F to open File menu
send_keys('%f')  # Alt+F
time.sleep(0.5)

# Press O for Open
send_keys('o')
time.sleep(0.5)

# Type the path
path = r'C:\Users\y2k1\Downloads\crackme_zapline\crackme_zapline.exe'
send_keys(path)
time.sleep(0.5)

# Press Enter to open
send_keys('{ENTER}')
time.sleep(2)

print('File open command sent')
