import ctypes
import sys

user32 = ctypes.windll.user32

# Try to change display settings
# CDS_UPDATEREGISTRY = 0x02
# DM_PELSWIDTH = 0x80000
# DM_PELSHEIGHT = 0x100000

# First, restore to default
result = user32.ChangeDisplaySettingsW(None, 0)
print(f"Restore result: {result}")

# Try with enumdisplaydevices
user32.EnumDisplayDevicesW(None, 0, ctypes.byref(ctypes.create_string_buffer(512)), 0)

print("Done")
