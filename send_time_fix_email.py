import smtplib
from email.mime.text import MIMEText
from email.header import Header

# 邮件配置
smtp_server = "smtp.126.com"
smtp_port = 465
username = "cnxgx@126.com"
password = "DBeVz33w2M666uEj"  # SMTP授权密码

# 邮件内容
subject = "ESXi虚拟机Windows时间错乱问题处理方案"
body = """
<h2>问题描述</h2>
<p>ESXi下的Windows 10虚拟机，即使在VMware Tools中取消时间同步、主板时间正确、Windows取消自动同步，时间仍然会快8小时。</p>

<h2>根本原因</h2>
<ol>
<li><strong>VMICTimeProvider未禁用</strong>：VMware在注册表中隐藏的时间同步服务仍在偷偷同步</li>
<li><strong>注册表Bias值损坏</strong>：时间偏移量寄存器损坏，导致时间计算错误</li>
<li><strong>Windows时间服务未禁用</strong>：服务可能自动重启同步</li>
</ol>

<h2>解决方案（已执行）</h2>
<ol>
<li>禁用VMICTimeProvider注册表项（HKLM\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\VMICTimeProvider\Enabled = 0）</li>
<li>修复注册表Bias和ActiveTimeBias值（设为0）</li>
<li>禁用Windows时间服务（sc config w32time start= disabled）</li>
</ol>

<h2>后续步骤</h2>
<ol>
<li>重启虚拟机</li>
<li>手动校准时间为正确的北京时间</li>
<li>关闭自动时间同步设置</li>
</ol>

<h2>预防措施</h2>
<p>以后如果时间再出问题，检查以下位置：</p>
<ul>
<li>VMware Tools设置中的"同步guest time with host"必须取消</li>
<li>注册表VMICTimeProvider必须为0</li>
<li>确保没有其他同步软件</li>
</ul>

<p>—— 星火AI助手</p>
"""

# 创建邮件
msg = MIMEText(body, "html", "utf-8")
msg["Subject"] = Header(subject, "utf-8")
msg["From"] = username
msg["To"] = username

# 发送邮件
try:
    server = smtplib.SMTP_SSL(smtp_server, smtp_port)
    server.login(username, password)
    server.sendmail(username, [username], msg.as_string())
    server.quit()
    print("邮件发送成功！")
except Exception as e:
    print(f"发送失败: {e}")
