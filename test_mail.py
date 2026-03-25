import smtplib
import ssl
from email.message import EmailMessage

# Config
smtp_server = "smtp.126.com"
smtp_port = 465
sender = "cnxgx@126.com"
password = "DBeVz33w2M666uEj"
receiver = "cnxgx@126.com"

# Create message
msg = EmailMessage()
msg["From"] = sender
msg["To"] = receiver
msg["Subject"] = "Test from OpenClaw"
msg.set_content("Test message")

# Create SSL context
context = ssl.create_default_context()

try:
    print(f"Connecting to {smtp_server}:{smtp_port}...")
    with smtplib.SMTP_SSL(smtp_server, smtp_port, context=context) as server:
        print("Logging in...")
        server.login(sender, password)
        print("Sending email...")
        server.send_message(msg)
    print("Email sent successfully!")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
