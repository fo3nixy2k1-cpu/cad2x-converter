import sqlite3
conn = sqlite3.connect('/home/y2k1/.openclaw/memory/main.sqlite')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cur.fetchall()
print('Tables:', tables)
for t in tables:
    tname = t[0]
    cur.execute(f"PRAGMA table_info({tname})")
    cols = cur.fetchall()
    print(f'Columns in {tname}:', [c[1] for c in cols])
conn.close()
