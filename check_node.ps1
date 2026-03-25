Get-Process node | ForEach-Object {
  $p = $_
  [PSCustomObject]@{
    Id = $p.Id
    MemMB = [math]::Round($p.WorkingSet64/1MB, 1)
    CPU = [math]::Round($p.CPU, 1)
    Threads = $p.Threads.Count
    Path = $p.Path
  }
} | Sort-Object CPU -Descending | Format-Table -AutoSize
