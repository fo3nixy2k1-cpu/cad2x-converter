# -*- coding: utf-8 -*-
import openpyxl

wb = openpyxl.load_workbook(r'C:\Users\y2k1\.openclaw\workspace\wl\gr.xlsx')
ws = wb.active

# Search for 河南浩之源通信工程有限公司
results = []
for row in ws.iter_rows(min_row=3, values_only=True):
    if row[6]:
        cell_val = str(row[6])
        if '河南浩之源通信工程有限公司' in cell_val:
            results.append({
                'date': str(row[10])[:10] if row[10] else '',
                'amount': row[8],
                'party': cell_val
            })

print(f'Found {len(results)} rows:')
for r in results:
    print(f"{r['date']}: {r['amount']} - {r['party']}")
