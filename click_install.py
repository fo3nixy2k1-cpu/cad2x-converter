import pyautogui
import time

print("屏幕尺寸:", pyautogui.size())

# 移动到添加至Chrome按钮位置并点击
# 先让用户把鼠标移到按钮上
print("请在5秒内把鼠标移到'添加至Chrome'按钮上...")
time.sleep(5)

x, y = pyautogui.position()
print(f"鼠标位置: {x}, {y}")
pyautogui.click()
print("已点击")
