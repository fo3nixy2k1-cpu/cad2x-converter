# -*- coding: utf-8 -*-
import pandas as pd

# Read gr.xlsx
df = pd.read_excel(r'C:\Users\y2k1\.openclaw\workspace\wl\gr.xlsx', header=1, dtype=str)

# Search for 借 in summary column (column 13)
target = '借'
lending_records = []
for idx, row in df.iterrows():
    summary = str(row.iloc[13]) if pd.notna(row.iloc[13]) else ''
    if target in summary:
        lending_records.append({
            'date': str(row.iloc[10])[:10] if pd.notna(row.iloc[10]) else '',
            'party': str(row.iloc[6]) if pd.notna(row.iloc[6]) else '',
            'amount': str(row.iloc[8]) if pd.notna(row.iloc[8]) else '',
            'summary': summary
        })

print(f'Found {len(lending_records)} lending records with 借:')
for r in lending_records[:20]:
    print(f"{r['date']}: {r['amount']} - {r['party']} - {r['summary']}")
