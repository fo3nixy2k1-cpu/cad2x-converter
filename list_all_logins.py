import sqlite3
import os
import shutil

# Chrome登录数据路径
login_db = os.path.join(os.environ['LOCALAPPDATA'], 'Google', 'Chrome', 'User Data', 'Default', 'Login Data')

if not os.path.exists(login_db):
    print(f"Chrome文件不存在")
else:
    temp_db = os.path.join(os.environ['TEMP'], 'login_data.db')
    shutil.copy2(login_db, temp_db)
    
    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    
    # 查询所有登录记录
    cursor.execute("SELECT origin_url, username_value FROM logins ORDER BY date_last_used DESC LIMIT 20")
    
    print("Chrome保存的登录信息 (最近20条):")
    for row in cursor.fetchall():
        print(f"- {row[0]} | 用户名: {row[1]}")
    
    conn.close()
    os.remove(temp_db)

# Edge登录数据路径
login_db2 = os.path.join(os.environ['LOCALAPPDATA'], 'Microsoft', 'Edge', 'User Data', 'Default', 'Login Data')

if not os.path.exists(login_db2):
    print(f"Edge文件不存在")
else:
    temp_db2 = os.path.join(os.environ['TEMP'], 'edge_login_data.db')
    shutil.copy2(login_db2, temp_db2)
    
    conn = sqlite3.connect(temp_db2)
    cursor = conn.cursor()
    
    # 查询所有登录记录
    cursor.execute("SELECT origin_url, username_value FROM logins ORDER BY date_last_used DESC LIMIT 20")
    
    print("\nEdge保存的登录信息 (最近20条):")
    for row in cursor.fetchall():
        print(f"- {row[0]} | 用户名: {row[1]}")
    
    conn.close()
    os.remove(temp_db2)
