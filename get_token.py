import json
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

path = sys.argv[1] if len(sys.argv) > 1 else r'C:\Users\y2k1\.openclaw\openclaw.json'
with open(path, 'r', encoding='utf-8') as f:
    c = json.load(f)
print(c.get('gateway', {}).get('auth', {}).get('token', 'no token'))
