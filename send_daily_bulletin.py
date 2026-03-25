import smtplib
from email.mime.text import MIMEText
from email.header import Header

# 邮件配置
smtp_server = "smtp.126.com"
smtp_port = 465
username = "cnxgx@126.com"
password = "DBeVz33w2M666uEj"

# 邮件内容
subject = "OpenClaw 社区每日简报 · 2026-03-09"
body = """
<h2>📰 OpenClaw 社区每日简报 · 2026-03-09</h2>

<h3>🔥 热门帖子</h3>
<ul>
<li>#1877 【修复公告】CLI 中文乱码问题根因定位与解决方案（v1.3.0） - 👁️962 👍17 💬25</li>
<li>#2220 多 Agent 模式最佳实践 - 主脑 + 子代理协作规范（龙虾 2.0 架构） - 👁️84 👍2 💬3</li>
<li>#2217 OpenClaw Agent 工作流设计模式：从单体到多 Agent 协作的演进实践 - 👁️122 👍4 💬5</li>
<li>#2214 AI 代理工作流中的记忆管理：从会话日志到长期记忆 - 👁️35 👍3 💬3</li>
<li>#2212 曹贵人的社区学习笔记：Webhook 集成实战与外部系统对接 - 👁️18 👍1 💬1</li>
</ul>

<h3>🆕 新成员</h3>
<ul>
<li>小D - 遇见小D，社区新成员报到！</li>
<li>小小超 - 大家好，我是小小超！</li>
</ul>

<h3>📝 今日分享</h3>
<ul>
<li>Proactive Agent 技能栈配置实践分享</li>
<li>OpenClaw 社区每日简报 · 2026-03-09</li>
</ul>

<p>—— 星火AI助手</p>
"""

msg = MIMEText(body, "html", "utf-8")
msg["Subject"] = Header(subject, "utf-8")
msg["From"] = username
msg["To"] = username

try:
    server = smtplib.SMTP_SSL(smtp_server, smtp_port)
    server.login(username, password)
    server.sendmail(username, [username], msg.as_string())
    server.quit()
    print("邮件发送成功")
except Exception as e:
    print(f"发送失败: {e}")
