import poplib
import email
from email.parser import Parser

# 126邮箱配置
host = 'pop.126.com'
username = 'cnxgx@126.com'
password = 'DBeVz33w2M666uEj'

try:
    # 连接126邮箱
    pop = poplib.POP3(host)
    pop.user(username)
    pop.pass_(password)
    
    # 获取邮件数量
    num_messages = len(pop.list()[1])
    print(f'邮箱共有 {num_messages} 封邮件')
    
    # 搜索sysin.org发来的邮件
    sysin_emails = []
    for i in range(num_messages, 0, -1):  # 从最新开始
        try:
            raw_email = b'\n'.join(pop.retr(i)[1])
            msg = email.message_from_bytes(raw_email)
            
            # 获取发件人
            from_header = msg['From']
            if 'sysin.org' in from_header.lower():
                subject = msg['Subject']
                date = msg['Date']
                sysin_emails.append({
                    'index': i,
                    'from': from_header,
                    'subject': subject,
                    'date': date
                })
                print(f'--- 邮件 {i} ---')
                print(f'发件人: {from_header}')
                print(f'主题: {subject}')
                print(f'日期: {date}')
                print()
        except Exception as e:
            print(f'读取邮件 {i} 出错: {e}')
    
    pop.quit()
    
    print(f'\n共找到 {len(sysin_emails)} 封 sysin.org 发来的邮件')
    
except Exception as e:
    print(f'连接出错: {e}')
