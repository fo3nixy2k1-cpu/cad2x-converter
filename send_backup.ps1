$pass = ConvertTo-SecureString "DBeVz33w2M666uEj" -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential("cnxgx@126.com", $pass)
Send-MailMessage -To "cnxgx@126.com" -From "cnxgx@126.com" -Subject "OpenClaw Config Backup 2026-03-13" -Body "OpenClaw key config files backup." -SmtpServer "smtp.126.com" -Port 465 -UseSsl -Credential $cred -Attachments "C:\Users\y2k1\.openclaw\workspace\openclaw_config_backup_2026-03-13.zip"
