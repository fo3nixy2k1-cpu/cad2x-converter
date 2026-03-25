# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np

# Read with numeric_only=False to get all data
df = pd.read_excel(r'C:\Users\y2k1\.openclaw\workspace\wl\gr.xlsx', header=1)

# Find rows with the company
target = '河南浩之源通信工程有限公司'
results = []
for col in df.columns:
    mask = df[col].astype(str).str.contains(target, na=False)
    if mask.any():
        results.append(df[mask])

if results:
    combined = pd.concat(results).drop_duplicates()
    # Get specific columns - need to use column indices
    print('Found rows:')
    for idx, row in combined.iterrows():
        print(f"Date: {row.iloc[10]}, Amount: {row.iloc[8]}, Party col: {row.iloc[6]}")
else:
    print('Not found')
