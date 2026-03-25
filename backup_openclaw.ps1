# Backup script - runs at 0:00 and 12:00 daily
$backupDir = "C:\Users\y2k1\.openclaw\workspace\backup_temp"
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$zipPath = "C:\Users\y2k1\.openclaw\workspace\openclaw_backup_$timestamp.zip"

# Clean old backup
if (Test-Path $backupDir) {
    Remove-Item $backupDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$files = @(
    "C:\Users\y2k1\.openclaw\workspace\SOUL.md",
    "C:\Users\y2k1\.openclaw\workspace\USER.md",
    "C:\Users\y2k1\.openclaw\workspace\IDENTITY.md",
    "C:\Users\y2k1\.openclaw\workspace\AGENTS.md",
    "C:\Users\y2k1\.openclaw\workspace\MEMORY.md"
)

# Copy memory files
$memoryFiles = Get-ChildItem "C:\Users\y2k1\.openclaw\workspace\memory\*.md" -ErrorAction SilentlyContinue
if ($memoryFiles) {
    foreach ($f in $memoryFiles) {
        Copy-Item $f.FullName -Destination $backupDir -Force
    }
}

# Copy other files
foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $backupDir -Force
    }
}

# Copy config file
if (Test-Path "C:\Users\y2k1\.openclaw\openclaw.json") {
    Copy-Item "C:\Users\y2k1\.openclaw\openclaw.json" -Destination $backupDir -Force
}

# Copy credentials directory
if (Test-Path "C:\Users\y2k1\.openclaw\workspace\credentials") {
    $credDest = Join-Path $backupDir "credentials"
    Copy-Item "C:\Users\y2k1\.openclaw\workspace\credentials" -Destination $credDest -Recurse -Force
}

# Create zip
Compress-Archive -Path "$backupDir\*" -DestinationPath $zipPath -Force

# Send email
$subject = "OpenClaw Backup - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
$body = "OpenClaw backup file"

$msg = @"
From: cnxgx@126.com
To: cnxgx@126.com
Subject: $subject
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary=Boundary

--Boundary
Content-Type: text/plain; charset=utf-8

$body

--Boundary
Content-Type: application/zip
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename=openclaw_backup_$timestamp.zip

$([Convert]::ToBase64String([IO.File]::ReadAllBytes($zipPath)))

--Boundary--
"@

# Send email
$smtp = New-Object Net.Mail.SmtpClient("smtp.126.com", 465)
$smtp.EnableSsl = $true
$smtp.Credentials = New-Object Net.NetworkCredential("cnxgx@126.com", "DBeVz33w2M666uEj")
$smtp.Send("cnxgx@126.com", "cnxgx@126.com", $subject, $msg)

# Cleanup
Remove-Item $backupDir -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

Write-Host "Backup completed"
