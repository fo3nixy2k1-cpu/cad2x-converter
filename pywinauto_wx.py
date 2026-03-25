# -*- coding: utf-8 -*-
"""
pywinauto + wxauto 读取微信消息
"""
import pywinauto
import time
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("查找微信窗口...")

# 连接微信
app = pywinauto.Application(backend="win32")
try:
    app.connect(title="微信", class_name="mmui::MainWindow")
    print("已连接到微信")
except:
    print("未找到微信，请先打开微信")
    exit(1)

# 获取主窗口
dlg = app.window(title="微信")
dlg.set_focus()
time.sleep(0.5)

# 尝试获取聊天消息
# 先找到会话列表
print("尝试读取消息...")

# 使用 wxauto 来获取消息
try:
    import wxauto
    wx = wxauto.WeChat()
    
    # 获取消息
    msgs = wx.GetChatMessage("每日工作进度汇报群", count=30)
    print(f"获取到 {len(msgs)} 条消息:")
    for msg in msgs:
        print(f"  [{msg.time}] {msg.sender}: {msg.content[:50] if msg.content else ''}")
except Exception as e:
    print(f"wxauto获取失败: {e}")
    print("尝试其他方式...")
