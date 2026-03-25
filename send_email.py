import smtplib, ssl, email.message

sender = 'cnxgx@126.com'
password = 'DBeVz33w2M666uEj'
smtp_server = 'smtp.126.com'
port = 465

subject = 'API排查方案'
body = '''API rate limit 排查方案：

1. 检查并发使用
   - 确认是否有其他设备/实例共享同一 API key
   - MiniMax API key 通常允许多实例使用，但可能触发并发限制

2. 等待配额重置
   - API 配额通常每小时或每天重置
   - 观察错误提示的具体重置时间

3. 临时解决方案
   - 切换到备用模型（如 Step 3.5 Flash）
   - 申请更高配额或增加请求频率限制

4. 长期优化
   - 错峰调用 API，避免高峰期集中请求
   - 实现请求队列和重试机制
   - 监控 API 使用情况
'''

msg = email.message.EmailMessage()
msg['From'] = sender
msg['To'] = sender
msg['Subject'] = subject
msg.set_content(body)

context = ssl.create_default_context()
with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
    server.login(sender, password)
    server.send_message(msg)

print('Email sent')