import ezdxf
from ezdxf.addons import odafc
import sys

# 测试DWG转DXF
dwg_path = r"C:\Users\y2k1\.openclaw\media\outbound\ca6092c3-7d1c-4847-bf3e-4d859beaba3d.dwg"
dxf_path = r"C:\Users\y2k1\.openclaw\media\outbound\test_output.dxf"

print(f"Converting {dwg_path} to {dxf_path}...")
try:
    odafc.convert(dwg_path, dxf_path, version="R2018", audit=True)
    print("Conversion successful!")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

# 尝试读取DXF
print(f"Reading {dxf_path}...")
try:
    doc = ezdxf.readfile(dxf_path)
    print(f"DXF version: {doc.dxfversion}")
    print(f"Layouts: {len(doc.layouts)}")
    print("Conversion test passed!")
except Exception as e:
    print(f"Error reading DXF: {e}")
    sys.exit(1)
