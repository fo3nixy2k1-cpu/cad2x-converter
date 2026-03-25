import re
import sys

with open(r'C:\Users\y2k1\Downloads\crackme.exe', 'rb') as f:
    data = f.read()

# Extract ASCII strings (4+ chars)
strings = re.findall(b'[\x20-\x7e]{4,}', data)

# Keywords to search
keywords = [b'password', b'Password', b'correct', b'Correct', b'Wrong', b'wrong', 
            b'key', b'Key', b'serial', b'Register', b'OK', b'fail']

print("=== Found strings ===")
found = set()
for s in strings:
    s_lower = s.lower()
    for kw in keywords:
        if kw in s_lower:
            decoded = s.decode('ascii', errors='ignore')
            if decoded not in found:
                found.add(decoded)
                print(decoded)

print(f"\nTotal: {len(found)} strings found")
