# -*- coding: utf-8 -*-
import openpyxl

wb = openpyxl.load_workbook(r'C:\Users\y2k1\.openclaw\workspace\wl\gr.xlsx')
ws = wb.active

# Search in Excel for 河南浩之源通信工程有限公司
results = []
for row in ws.iter_rows(min_row=3, values_only=True):
    if row[6]:
        cell_val = str(row[6])
        # Check for bytes of 河 (e6 b2) or 亰 (e5 8d 97)
        cell_bytes = cell_val.encode('utf-8')
        # Check if contains '河'
        if b'\xe6\xb2' in cell_bytes:
            results.append({
                'date': str(row[10])[:10] if row[10] else '',
                'amount': row[8],
                'party': cell_val
            })

print(f'Found {len(results)} rows with 河 character:')
for r in results[:20]:
    print(f"{r['date']}: {r['amount']} - {r['party'][:50]}")
