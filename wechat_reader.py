"""
微信自动化读取群消息
需要先打开微信并登录
"""
from wxauto import WeChat
import time

# 初始化微信
wx = WeChat()

# 获取会话列表
print("获取会话列表...")
sessions = wx.GetSessionList()
print(f"会话数量: {len(sessions)}")

# 找群聊
group_name = "江门项目部工作汇报群"
print(f"\n尝试查找群: {group_name}")

# 获取聊天记录
try:
    msgs = wx.GetChatMessage(group_name, count=20)
    print(f"获取到 {len(msgs)} 条消息:")
    for msg in msgs:
        print(f"  [{msg.time}] {msg.sender}: {msg.content}")
except Exception as e:
    print(f"错误: {e}")
    print("尝试其他方式...")
    
    # 尝试获取所有会话
    for session in sessions:
        print(f"  - {session}")
