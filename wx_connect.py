# -*- coding: utf-8 -*-
"""
pywinauto 连接微信
"""
import pywinauto
import time
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("查找微信进程...")

# 通过进程名连接
try:
    app = pywinauto.Application(backend="win32").connect(process=1088)
    print("已连接到微信进程")
    
    # 获取主窗口
    dlg = app.window(title="微信")
    print(f"窗口标题: {dlg.window_text()}")
    
    dlg.set_focus()
    time.sleep(0.5)
    
    # 获取所有控件
    print("获取微信控件...")
    
    # 尝试获取聊天消息
    # 使用 wxauto 来读取
    try:
        import wxauto
        wx = wxauto.WeChat()
        
        # 获取群消息
        msgs = wx.GetChatMessage("每日工作进度汇报群", count=20)
        print(f"获取到 {len(msgs)} 条消息:")
        for msg in msgs:
            print(f"  [{msg.time}] {msg.sender}: {msg.content[:50] if msg.content else ''}")
    except Exception as e:
        print(f"wxauto错误: {e}")
        
except Exception as e:
    print(f"连接失败: {e}")
    import traceback
    traceback.print_exc()
