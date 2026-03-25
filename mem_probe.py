import sqlite3, os

db = '/home/y2k1/.openclaw/memory/main.sqlite'
conn = sqlite3.connect(db)
cur = conn.cursor()

# Check meta
cur.execute('SELECT * FROM meta')
print('META:', cur.fetchall())

# Check chunks - get sample text content from recent entries
cur.execute('SELECT id, path, source, substr(text, 1, 100), updated_at FROM chunks ORDER BY updated_at DESC LIMIT 10')
print('RECENT CHUNKS:')
for r in cur.fetchall():
    print(r)

conn.close()
