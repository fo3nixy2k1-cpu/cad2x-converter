# -*- coding: utf-8 -*-
"""
wxauto 读取微信群消息
"""
import wxauto
import time
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("初始化微信...")

# 获取微信实例
wx = wxauto.WeChat()

# 获取会话列表
print("获取会话列表...")
sessions = wx.GetSessionList()
print(f"共有 {len(sessions)} 个会话")

# 找群
target = "每日工作进度汇报群"
for session in sessions:
    if target in session:
        print(f"找到群: {session}")
        
        # 获取群消息
        print(f"获取 {session} 的消息...")
        try:
            msgs = wx.GetChatMessage(session, count=20)
            print(f"获取到 {len(msgs)} 条消息:")
            for msg in msgs:
                print(f"  [{msg.time}] {msg.sender}: {msg.content[:100] if msg.content else ''}")
        except Exception as e:
            print(f"获取消息失败: {e}")
        break
else:
    print(f"未找到群: {target}")
    print("可用会话:")
    for s in sessions[:10]:
        print(f"  - {s}")
