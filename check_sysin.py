import imaplib

m = imaplib.IMAP4_SSL('imap.126.com')
try:
    m.login('cnxgx@126.com', 'DBeVz33w2M666uEj')
    print('登录成功!')
    
    # 选择收件箱
    typ, _ = m.select('INBOX')
    print(f'选择邮箱: {typ}')
    
    # 搜索sysin.org发件人
    typ, data = m.search(None, 'FROM sysin.org')
    print(f'搜索结果: {typ}')
    
    email_list = data[0].split()
    print(f'找到 {len(email_list)} 封 sysin.org 邮件')
    
    if email_list:
        for num in email_list[-5:]:  # 最近5封
            typ, msg = m.fetch(num, '(SUBJECT FROM DATE)')
            print(f'邮件 {num.decode()}: {msg}')
    
    m.logout()
    print('完成!')
except Exception as e:
    print(f'错误: {e}')
