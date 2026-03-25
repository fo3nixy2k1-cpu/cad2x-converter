# -*- coding: utf-8 -*-
"""
激活微信窗口
"""
import ctypes
from ctypes import wintypes

user32 = ctypes.windll.user32

# 查找窗口并激活
def activate_wechat():
    # 查找微信窗口 - 类名是 mmui::MainWindow，标题是"微信"
    hwnd = user32.FindWindowW("mmui::MainWindow", None)
    if not hwnd:
        # 尝试其他方式
        hwnd = user32.FindWindowW(None, "微信")
    
    if hwnd:
        print(f"找到微信窗口: {hwnd}")
        # 激活窗口
        user32.SetForegroundWindow(hwnd)
        # 最大化
        user32.ShowWindow(hwnd, 3)  # SW_MAXIMIZE
        return True
    else:
        print("未找到微信窗口")
        return False

if __name__ == "__main__":
    activate_wechat()
