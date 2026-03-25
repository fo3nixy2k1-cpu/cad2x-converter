#!/usr/bin/env python3
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os

# Email config
smtp_server = "smtp.126.com"
smtp_port = 465
sender = "cnxgx@126.com"
password = "DBeVz33w2M666uEj"
receiver = "cnxgx@126.com"

# Create message
msg = MIMEMultipart()
msg["From"] = sender
msg["To"] = receiver
msg["Subject"] = "OpenClaw配置备份 2026-03-13"

body = "OpenClaw关键配置文件备份，请查收。"
msg.attach(MIMEText(body, "plain", "utf-8"))

# Attach file
attachment_path = r"C:\Users\y2k1\.openclaw\workspace\openclaw_config_backup_2026-03-13.zip"
if os.path.exists(attachment_path):
    with open(attachment_path, "rb") as f:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f"attachment; filename=openclaw_config_backup_2026-03-13.zip")
        msg.attach(part)

# Send email
try:
    server = smtplib.SMTP_SSL(smtp_server, smtp_port)
    server.login(sender, password)
    server.sendmail(sender, receiver, msg.as_string())
    server.quit()
    print("Email sent successfully!")
except Exception as e:
    print(f"Failed to send email: {e}")
