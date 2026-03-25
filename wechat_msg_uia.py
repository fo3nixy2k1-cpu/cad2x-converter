# -*- coding: utf-8 -*-
"""
使用UIAutomation直接读取微信消息
"""
import uiautomation as uia
import time
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("查找微信窗口...")

# 找到微信窗口
wechat = uia.WindowControl(Name="微信", ClassName="mmui::MainWindow")
if not wechat.Exists(maxSearchSeconds=3):
    print("未找到微信窗口")
    exit(1)

print(f"找到微信: {wechat.Name}")
wechat.SetFocus()
time.sleep(1)

# 找到会话列表
list_control = wechat.ListControl(Name="会话")
if not list_control.Exists(maxSearchSeconds=2):
    list_control = wechat.ListControl(Name="消息")

if not list_control.Exists():
    print("未找到会话列表")
    exit(1)

# 获取会话
items = list_control.GetChildren()
print(f"找到 {len(items)} 个会话")

# 找群
target = "每日工作进度汇报群"
target_item = None

for item in items:
    try:
        name = item.Name
        if name and target in name:
            print(f"找到目标群: {name}")
            target_item = item
            break
    except:
        pass

if not target_item:
    print(f"未找到 {target}")
    print("可用会话:")
    for item in items[:10]:
        try:
            if item.Name:
                print(f"  - {item.Name}")
        except:
            pass
    exit(1)

# 点击进入群
print("点击进入群...")
target_item.Click()
time.sleep(2)

# 获取聊天消息
# 微信的消息区域通常是一个 Document 或 List
print("获取聊天消息...")

# 查找聊天区域
found_msgs = []
for ctrl in wechat.GetChildren():
    try:
        # 查找包含消息的控件
        if ctrl.ControlTypeName in ["ListControl", "DocumentControl", "ScrollBarControl"]:
            children = ctrl.GetChildren()
            for child in children[:50]:
                try:
                    txt = child.Name
                    if txt and len(txt) > 3:
                        # 过滤掉明显不是消息的内容
                        if not any(x in txt for x in ["会话", "通讯录", "朋友圈", "小程序", "游戏", "设置"]):
                            print(f"  {txt[:80]}")
                            found_msgs.append(txt)
                except:
                    pass
    except:
        pass

print(f"\n共找到 {len(found_msgs)} 条消息内容")
