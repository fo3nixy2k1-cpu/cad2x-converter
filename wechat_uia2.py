"""
微信自动化 - 使用UIAutomation直接读取
"""
import uiautomation as uia
import time

print("搜索微信窗口...")

# 尝试找到微信
desktop = uia.GetRootControl()

# 遍历所有窗口
wechat = None
for window in desktop.GetChildren():
    if window.ControlTypeName == "WindowControl":
        name = window.Name or ""
        classname = window.ClassName or ""
        # 打印所有窗口用于调试
        if "微信" in name or "WeChat" in name:
            print(f"找到窗口: Name={name}, ClassName={classname}")
            wechat = window
            break

if not wechat:
    print("未找到微信窗口，请确保微信已打开并登录")
    exit(1)

print(f"找到微信: {wechat.Name}")
wechat.SetForeground()
time.sleep(1)

# 获取聊天窗口
chat = wechat.ListControl(Name="消息")
if chat.Exists():
    items = chat.GetChildren()
    print(f"找到 {len(items)} 条会话")
    for item in items[:10]:
        if item.Name:
            print(f"  - {item.Name}")
else:
    print("未找到消息列表")
