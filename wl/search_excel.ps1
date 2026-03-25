$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open("C:\Users\y2k1\.openclaw\workspace\wl\gr.xlsx")
$ws = $wb.Sheets.Item(1)

$totalRows = $ws.UsedRange.Rows.Count

$results = @()
for ($i = 3; $i -le $totalRows; $i++) {
    $party = $ws.Cells.Item($i, 7).Text
    if ($party -like "*河南浩之源通信工程有限公司*") {
        $date = $ws.Cells.Item($i, 11).Text
        $amount = $ws.Cells.Item($i, 9).Text
        $results += [PSCustomObject]@{
            Date = $date
            Amount = $amount
            Party = $party
        }
    }
}

Write-Host "Found: $($results.Count) rows"
$results | Format-Table -AutoSize

$wb.Close($false)
$excel.Quit()
