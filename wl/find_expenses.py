# -*- coding: utf-8 -*-
import pandas as pd
from collections import defaultdict

# Read gr.xlsx
df = pd.read_excel(r'C:\Users\y2k1\.openclaw\workspace\wl\gr.xlsx', header=1, dtype=str)

# Find all expense records (negative amounts)
# and group by counterparty
party_expenses = defaultdict(float)
for idx, row in df.iterrows():
    amount_str = str(row.iloc[8]) if pd.notna(row.iloc[8]) else '0'
    try:
        amount = float(amount_str)
        if amount < 0:
            party = str(row.iloc[6]) if pd.notna(row.iloc[6]) else 'Unknown'
            party_expenses[party] += abs(amount)
    except:
        pass

# Sort by total expense amount
sorted_expenses = sorted(party_expenses.items(), key=lambda x: x[1], reverse=True)

print('Top 20 counterparties by total expenses (money paid out):')
for party, total in sorted_expenses[:20]:
    print(f'{total:,.2f} - {party}')
