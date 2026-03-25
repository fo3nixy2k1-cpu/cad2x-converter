# -*- coding: utf-8 -*-
"""
wxauto 读取微信消息
"""
import wxauto
import time
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("初始化...")

# 获取微信实例
wx = wxauto.WeChat()

# 获取会话列表
print("获取会话列表...")
sessions = wx.GetSessionList()
print(f"共有 {len(sessions)} 个会话")

# 找目标群
target = "每日工作进度汇报群"
for s in sessions:
    if target in s:
        print(f"找到群: {s}")
        try:
            msgs = wx.GetChatMessage(s, count=30)
            print(f"获取到 {len(msgs)} 条消息:")
            for m in msgs:
                print(f"  [{m.time}] {m.sender}: {m.content[:50] if m.content else ''}")
        except Exception as e:
            print(f"错误: {e}")
        break
else:
    print(f"未找到 {target}")
    print("可用会话:", sessions[:10])
