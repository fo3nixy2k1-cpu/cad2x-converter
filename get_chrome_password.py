import sqlite3
import os
import json

# Chrome登录数据路径
login_db = os.path.join(os.environ['LOCALAPPDATA'], 'Google', 'Chrome', 'User Data', 'Default', 'Login Data')

if not os.path.exists(login_db):
    print(f"文件不存在: {login_db}")
    exit(1)

# 复制数据库（因为Chrome会锁定）
import shutil
temp_db = os.path.join(os.environ['TEMP'], 'login_data.db')
shutil.copy2(login_db, temp_db)

conn = sqlite3.connect(temp_db)
cursor = conn.cursor()

# 查询126邮箱的密码
cursor.execute("""
    SELECT origin_url, username_value, password_value 
    FROM logins 
    WHERE origin_url LIKE '%126.com%'
""")

results = cursor.fetchall()
print(f"找到 {len(results)} 条126.com相关记录:")
for row in results:
    print(f"URL: {row[0]}")
    print(f"用户名: {row[1]}")
    print(f"密码(加密): {row[2]}")
    print("---")

conn.close()
os.remove(temp_db)
