"""
微信自动化 - 使用UIAutomation直接读取
"""
import uiautomation as uia
import time

print("搜索微信窗口...")

# 找到微信窗口
wechat = uia.WindowControl(Name="微信", ClassName="WeChat")
if not wechat.Exists(maxSearchSeconds=5):
    print("未找到微信窗口，请先打开微信")
    exit(1)

print("找到微信窗口")
wechat.SetForeground()

# 获取会话列表
time.sleep(1)

# 查找好友/群聊列表
list_control = wechat.ListControl(Name="会话")
if list_control.Exists():
    items = list_control.GetChildren()
    print(f"找到 {len(items)} 个会话项")
    
    for item in items[:15]:
        name = item.Name
        if name:
            print(f"  - {name}")
else:
    print("未找到会话列表")
