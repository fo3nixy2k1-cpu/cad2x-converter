"""
自动化操作脚本 - 在你本地电脑运行
需要先安装: pip install pyautogui pillow mss pytesseract
"""
import pyautogui
import mss
import os
from PIL import Image

# 截图
def screenshot(filename="screen.png"):
    with mss.mss() as s:
        img = s.grab(s.monitors[1])
        pil_img = Image.frombytes('RGB', img.size, img.bgra, 'raw', 'BGRX')
        pil_img.save(filename)
    print(f"截图已保存: {filename}")

# 获取文字 (需要安装 tesseract)
def get_text(filename="screen.png"):
    import pytesseract
    text = pytesseract.pytesseract.image_to_string(filename, lang='chi_sim+eng')
    print(text)
    return text

# 点击
def click(x, y):
    pyautogui.click(x, y)
    print(f"点击: ({x}, {y})")

# 输入
def type_text(text):
    pyautogui.typewrite(text)
    print(f"输入: {text}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("用法: python auto.py <命令> [参数]")
        print("命令: screenshot, click x y, type text")
    else:
        cmd = sys.argv[1]
        if cmd == "screenshot":
            screenshot()
        elif cmd == "click" and len(sys.argv) == 4:
            click(int(sys.argv[2]), int(sys.argv[3]))
        elif cmd == "type" and len(sys.argv) >= 3:
            type_text(" ".join(sys.argv[2:]))
