# 第二方案：使用 System.Net.Mail.SmtpClient 发送邮件
# 标准化 SMTP 配置，支持 TLS 1.2

$From       = 'cnxgx@126.com'
$To         = 'cnxgx@126.com'
$Subject    = 'API排查方案'
$Body       = @"
API rate limit 排查方案：

1. 检查并发使用
   • 确认是否有其他设备/实例共享同一 API key
   • MiniMax API key 通常允许多实例使用，但可能触发并发限制

2. 等待配额重置
   • API 配额通常每小时或每天重置
   • 观察错误提示的具体重置时间

3. 临时解决方案
   • 切换到备用模型（如 Step 3.5 Flash）
   • 申请更高配额或增加请求频率限制

4. 长期优化
   • 错峰调用 API，避免高峰期集中请求
   • 实现请求队列和重试机制
   • 监控 API 使用情况

执行时间：2026-03-08 18:58
"@

# 创建 SMTP 客户端
$smtpServer = 'smtp.126.com'
$smtpPort   = 465
$credential = New-Object System.Net.NetworkCredential($From, 'DBeVz33w2M666uEj')

$smtp = New-Object System.Net.Mail.SmtpClient($smtpServer, $smtpPort)
$smtp.EnableSsl = $true
$smtp.UseDefaultCredentials = $false
$smtp.Credentials = $credential

# 创建邮件消息
$mail = New-Object System.Net.Mail.MailMessage
$mail.From = $From
$mail.To.Add($To)
$mail.Subject = $Subject
$mail.Body = $Body
$mail.IsBodyHtml = $false

# 发送邮件
try {
    $smtp.Send($mail)
    Write-Host "✅ 第二方案：邮件发送成功"
} catch {
    Write-Host "❌ 发送失败: $($_.Exception.Message)"
} finally {
    $smtp.Close()
}