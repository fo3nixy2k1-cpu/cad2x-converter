# -*- coding: utf-8 -*-
import openpyxl
from collections import defaultdict

wb = openpyxl.load_workbook(r'C:\Users\y2k1\.openclaw\workspace\wl\gr.xlsx')
ws = wb.active

# Collect ALL unique counterparties and their amounts
counterparties = defaultdict(list)
for row in ws.iter_rows(min_row=3, values_only=True):
    if row[6] and row[8]:  # Column 7 (counterparty) and Column 9 (amount)
        counterparty = str(row[6])
        amount = float(row[8]) if row[8] else 0
        date = str(row[10])[:10] if row[10] else ''
        counterparties[counterparty].append({'date': date, 'amount': amount})

# Print all unique counterparties to a file
with open(r'C:\Users\y2k1\.openclaw\workspace\wl\counterparties.txt', 'w', encoding='utf-8') as f:
    for cp, transactions in sorted(counterparties.items()):
        f.write(f'{cp}: {len(transactions)} transactions\n')
        for t in transactions[:3]:  # Show first 3
            f.write(f'  {t["date"]}: {t["amount"]}\n')
        f.write('\n')

print('Saved to counterparties.txt')
print(f'Total unique counterparties: {len(counterparties)}')
