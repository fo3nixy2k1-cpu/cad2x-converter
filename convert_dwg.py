# -*- coding: utf-8 -*-
import subprocess
import os
import sys

# DWG文件路径
dwg_file = r"C:\Users\y2k1\.openclaw\media\outbound\ca6092c3-7d1c-4847-bf3e-4d859beaba3d.dwg"
output_dir = r"C:\Users\y2k1\.openclaw\media\outbound"

# 先用LibreCAD把DWG转成DXF
dxf_file = os.path.join(output_dir, "temp.dxf")

# LibreCAD命令 - 尝试后台转换
librecad = r"C:\Users\y2k1\scoop\apps\librecad\current\LibreCAD.exe"

cmd = f'"{librecad}" -exit -convert "{dwg_file}"'
print(f"执行命令: {cmd}")

try:
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
    print(f"返回码: {result.returncode}")
    print(f"stdout: {result.stdout}")
    print(f"stderr: {result.stderr}")
except Exception as e:
    print(f"错误: {e}")
