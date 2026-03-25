# -*- coding: utf-8 -*-
"""
微信自动化 - 使用UIAutomation直接读取
"""
import uiautomation as uia
import time
import sys
import io

# 设置UTF-8输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("搜索微信窗口...")

# 找到微信主窗口
wechat = uia.WindowControl(Name="微信", ClassName="mmui::MainWindow")

if not wechat.Exists(maxSearchSeconds=5):
    print("未找到微信窗口，请确保微信已打开并登录")
    exit(1)

print(f"找到微信: {wechat.Name}")
wechat.SetFocus()
time.sleep(1)

# 获取会话列表
try:
    chat_list = wechat.ListControl(Name="会话")
    if not chat_list.Exists(maxSearchSeconds=2):
        chat_list = wechat.ListControl(Name="消息")
    
    if chat_list.Exists():
        items = chat_list.GetChildren()
        print(f"找到 {len(items)} 条会话")
        for item in items[:15]:
            try:
                name = item.Name
                if name:
                    print(f"  - {name}")
            except:
                pass
    else:
        print("未找到会话列表")
except Exception as e:
    print(f"错误: {e}")
