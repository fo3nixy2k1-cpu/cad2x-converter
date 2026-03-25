# -*- coding: utf-8 -*-
import csv
import pandas as pd

# Read CMB CSV - need to handle the encoding properly
results = []

# Try different approaches to read the file
with open(r'C:\Users\y2k1\.openclaw\workspace\wl\cmb.csv', 'rb') as f:
    content = f.read()
    
# Try GBK encoding
content_gbk = content.decode('gbk')
lines = content_gbk.split('\n')

for i, line in enumerate(lines):
    if '借钱' in line or '借款' in line:
        print(f"Found in line {i}: {line[:100]}")
        # Parse the line
        parts = line.strip().split(',')
        if len(parts) >= 6:
            results.append({
                'line_num': i,
                'raw': line[:150]
            })

print(f'\nTotal found: {len(results)}')
