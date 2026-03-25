# -*- coding: utf-8 -*-
import pandas as pd
from openpyxl import Workbook

# Read data from both sources
df = pd.read_excel(r'C:\Users\y2k1\.openclaw\workspace\wl\gr.xlsx', header=1, dtype=str)

# Find 河南浩之源通信工程有限公司 records
target = '河南浩之源通信工程有限公司'
hanzhiyuan = []
for col in df.columns:
    mask = df[col].astype(str).str.contains(target, na=False)
    if mask.any():
        for idx, row in df[mask].iterrows():
            # Column 10 is date, column 8 is amount, column 6 is counterparty
            hanzhiyuan.append({
                '日期': str(row.iloc[10])[:10] if pd.notna(row.iloc[10]) else '',
                '交易对手': str(row.iloc[6]) if pd.notna(row.iloc[6]) else '',
                '交易金额': str(row.iloc[8]) if pd.notna(row.iloc[8]) else ''
            })

print(f'Found {len(hanzhiyuan)} rows for 河南浩之源通信工程有限公司')

# Read 陈亚 from CSV
import csv
chenya = []
with open(r'C:\Users\y2k1\.openclaw\workspace\wl\cmb.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    for row in reader:
        line = ','.join(row)
        if '陈亚' in line:
            parts = line.split(',')
            if len(parts) >= 7:
                date = parts[0].strip().replace('\t', '')
                income = parts[2].strip().replace('\t', '') if len(parts) > 2 else ''
                outcome = parts[3].strip().replace('\t', '') if len(parts) > 3 else ''
                amount = income if income else ('-' + outcome if outcome else '')
                chenya.append({
                    '日期': date,
                    '交易对手': '陈亚',
                    '交易金额': amount
                })

print(f'Found {len(chenya)} rows for 陈亚')

# Create output Excel
output_wb = Workbook()
output_ws = output_wb.active
output_ws.title = '往来款'

output_ws['A1'] = '日期'
output_ws['B1'] = '交易对手'
output_ws['C1'] = '交易金额'

row_num = 2

# Write 陈亚
for record in chenya:
    output_ws[f'A{row_num}'] = record['日期']
    output_ws[f'B{row_num}'] = record['交易对手']
    output_ws[f'C{row_num}'] = record['交易金额']
    row_num += 1

# Write 河南浩之源通信工程有限公司
for record in hanzhiyuan:
    output_ws[f'A{row_num}'] = record['日期']
    output_ws[f'B{row_num}'] = record['交易对手']
    output_ws[f'C{row_num}'] = record['交易金额']
    row_num += 1

output_wb.save(r'C:\Users\y2k1\.openclaw\workspace\wl\往来款汇总.xlsx')
print(f'\nSaved to 往来款汇总.xlsx! Total rows: {row_num - 1}')
