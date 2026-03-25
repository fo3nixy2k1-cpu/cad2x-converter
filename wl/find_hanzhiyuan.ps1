$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open("C:\Users\y2k1\.openclaw\workspace\wl\gr.xlsx")
$ws = $wb.Sheets.Item(1)

$used = $ws.UsedRange
$totalRows = $used.Rows.Count

$hanzhiyuan = @()

for ($i = 3; $i -le $totalRows; $i++) {
    $counterparty = $ws.Cells.Item($i, 7).Text
    if ($counterparty -match "浩之源" -and $counterparty -match "通信") {
        $date = $ws.Cells.Item($i, 11).Text
        $amount = $ws.Cells.Item($i, 9).Text
        $hanzhiyuan += [PSCustomObject]@{
            Date = $date
            Amount = $amount
            Counterparty = $counterparty
        }
    }
}

Write-Host "Found $($hanzhiyuan.Count) rows for 河南浩之源通信工程有限公司"
$hanzhiyuan | ForEach-Object { Write-Host "Date: $($_.Date), Amount: $($_.Amount), Party: $($_.Counterparty)" }

$wb.Close($false)
$excel.Quit()
