"""
微信自动化 - 使用UIAutomation直接读取
"""
import uiautomation as uia
import time

print("搜索微信窗口...")

# 找到微信主窗口
wechat = uia.WindowControl(Name="微信", ClassName="mmui::MainWindow")

if not wechat.Exists(maxSearchSeconds=5):
    print("未找到微信窗口，请确保微信已打开并登录")
    exit(1)

print(f"找到微信: {wechat.Name}")
wechat.SetFocus()
time.sleep(1)

# 获取会话列表 - 查找 ListControl
# 微信的会话列表通常是一个列表控件
try:
    # 尝试找到会话列表
    chat_list = wechat.ListControl(Name="会话")
    if not chat_list.Exists(maxSearchSeconds=2):
        chat_list = wechat.ListControl(Name="消息")
    
    if chat_list.Exists():
        items = chat_list.GetChildren()
        print(f"找到 {len(items)} 条会话")
        for item in items[:15]:
            name = item.Name
            if name:
                print(f"  - {name}")
    else:
        print("未找到会话列表，尝试其他方式...")
        # 打印微信的子控件用于调试
        children = wechat.GetChildren()
        print(f"微信窗口有 {len(children)} 个子控件")
        for child in children[:10]:
            print(f"  {child.ControlTypeName}: {child.Name}")
except Exception as e:
    print(f"错误: {e}")
    import traceback
    traceback.print_exc()
