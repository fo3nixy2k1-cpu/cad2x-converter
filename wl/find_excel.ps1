# Excel COM reading
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$wb = $excel.Workbooks.Open("C:\Users\y2k1\.openclaw\workspace\wl\gr.xlsx")
$ws = $wb.Sheets.Item(1)
$used = $ws.UsedRange
$totalRows = $used.Rows.Count

$results = @()
for ($i = 3; $i -le $totalRows; $i++) {
    $cellValue = $ws.Cells.Item($i, 7).Text
    if ($cellValue -match "浩之源") {
        $date = $ws.Cells.Item($i, 11).Text
        $amount = $ws.Cells.Item($i, 10).Text
        $counterparty = $ws.Cells.Item($i, 7).Text
        $obj = [PSCustomObject]@{
            Date = $date
            Amount = $amount
            Counterparty = $counterparty
        }
        $results += $obj
    }
}

Write-Host "Found $($results.Count) rows"
$results | Format-Table -AutoSize

$wb.Close($false)
$excel.Quit()
