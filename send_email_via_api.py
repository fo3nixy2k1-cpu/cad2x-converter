import requests
import json
import time

session = requests.Session()

# 1. 先获取登录页，建立session
r = session.get('https://mail.126.com/', timeout=10)
print('Initial:', r.status_code, r.url)

# 126 email uses a specific login flow
# Let's find the actual login endpoint
login_url = 'https://mail.126.com/yemian/login.html'
r = session.get(login_url, timeout=10)
print('Login page:', r.status_code)

# Get the sid from cookie or URL
cookies = session.cookies.get_dict()
print('Cookies after init:', cookies)

# Try to login - 126 uses a specific AJAX login API
# The typical endpoint for 126 webmail login
sid = 'hFyQOubbkJmvgyUNHfBGZEkPlHaOhPIM'  # This would be dynamic

# 126 email login API
login_api = 'https://mail.126.com/js6/s'
login_data = {
    'username': 'cnxgx@126.com',
    'password': 'Testonly.1a',
    'sid': sid
}

# Try different login approaches
try:
    r = session.post('https://mail.126.com/js6/login', data=login_data, timeout=10)
    print('Login attempt 1:', r.status_code, r.text[:500])
except Exception as e:
    print('Login error:', e)
