# -*- coding: utf-8 -*-
import pandas as pd

# Read gr.xlsx
df = pd.read_excel(r'C:\Users\y2k1\.openclaw\workspace\wl\gr.xlsx', header=1, dtype=str)

# Search for 借钱 or 借款 in the summary column (column 13)
keywords = ['借钱', '借款']
results = []

for idx, row in df.iterrows():
    summary = str(row.iloc[13]) if pd.notna(row.iloc[13]) else ''
    amount = str(row.iloc[8]) if pd.notna(row.iloc[8]) else ''
    date = str(row.iloc[10])[:10] if pd.notna(row.iloc[10]) else ''
    party = str(row.iloc[6]) if pd.notna(row.iloc[6]) else ''
    
    if any(kw in summary for kw in keywords):
        results.append({
            'date': date,
            'party': party,
            'amount': amount,
            'summary': summary
        })

print(f'Found {len(results)} records with 借钱/借款:\n')
for r in results:
    print(f"日期: {r['date']}")
    print(f"交易对手: {r['party']}")
    print(f"金额: {r['amount']}")
    print(f"摘要: {r['summary']}")
    print('-' * 30)
