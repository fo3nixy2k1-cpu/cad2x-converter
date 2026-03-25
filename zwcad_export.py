# -*- coding: utf-8 -*-
import subprocess
import os
import time

dwg_file = r"C:\Users\y2k1\.openclaw\media\outbound\ca6092c3-7d1c-4847-bf3e-4d859beaba3d.dwg"
output_png = r"C:\Users\y2k1\.openclaw\media\outbound\ca6092c3-7d1c-4847-bf3e-4d859beaba3d.png"

# 中望CAD路径
zwcad = r"C:\Program Files\ZWSOFT\ZWCAD 2025\ZWCAD.exe"

# 创建脚本来自动导出PNG
script_content = f"""(defun c:ExportPNG ()
  (command "_.PLOT" "Y" "" "Model" "PNG" "{output_png.replace('\\', '/')}" "" "")
  (princ)
)
(c:ExportPNG)
"""

script_file = r"C:\Users\y2k1\.openclaw\workspace\export_png.scr"
with open(script_file, 'w') as f:
    f.write(script_content)

print(f"脚本已创建: {script_file}")
print(f"将执行: {zwcad} {dwg_file} /b {script_file}")

# 尝试启动中望CAD并执行脚本
cmd = f'"{zwcad}" "{dwg_file}" /b "{script_file}"'
print(f"命令: {cmd}")

try:
    result = subprocess.Popen(cmd, shell=True)
    print(f"进程已启动, PID: {result.pid}")
    time.sleep(10)
    
    # 检查输出文件
    if os.path.exists(output_png):
        print(f"成功! 文件已生成: {output_png}")
    else:
        print("文件尚未生成，等待中...")
        time.sleep(5)
        if os.path.exists(output_png):
            print(f"成功! 文件已生成: {output_png}")
        else:
            print("超时，文件未生成")
            
except Exception as e:
    print(f"错误: {e}")
