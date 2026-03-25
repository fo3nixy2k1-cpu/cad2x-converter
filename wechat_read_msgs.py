# -*- coding: utf-8 -*-
"""
微信自动化 - 读取群消息
"""
import uiautomation as uia
import time
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("搜索微信窗口...")

# 找到微信
wechat = uia.WindowControl(Name="微信", ClassName="mmui::MainWindow")
if not wechat.Exists(maxSearchSeconds=5):
    print("未找到微信")
    exit(1)

wechat.SetFocus()
time.sleep(1)

# 找到会话列表并点击目标群
chat_list = wechat.ListControl(Name="会话")
if not chat_list.Exists(maxSearchSeconds=2):
    chat_list = wechat.ListControl(Name="消息")

items = chat_list.GetChildren()
target = "每日工作进度汇报群"

for item in items:
    try:
        name = item.Name
        if name and target in name:
            print(f"点击群: {name}")
            item.Click()
            time.sleep(2)
            break
    except:
        pass

# 获取聊天消息
# 查找聊天区域
chat_area = wechat.EditControl(Name="输入")
if chat_area.Exists():
    print("找到聊天输入框")
    
# 尝试获取消息列表 - 微信的消息是在一个 List 或 Document 中
# 查找包含消息的区域
msgs = []
for control in wechat.GetChildren():
    try:
        # 查找可能包含消息的控件
        if control.ControlTypeName in ["ListControl", "DocumentControl"]:
            children = control.GetChildren()
            for child in children[:20]:
                try:
                    txt = child.Name
                    if txt and len(txt) > 2:
                        print(f"消息: {txt[:100]}")
                except:
                    pass
    except:
        pass
