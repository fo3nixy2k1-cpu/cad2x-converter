"""
星火 HTTP 服务 - 接收火火消息并写入飞书文档
"""
from flask import Flask, request, jsonify
from datetime import datetime
import requests
import os

app = Flask(__name__)

# 配置
DOC_TOKEN = "DrpCwHoImisfJxka8k8cUUMgnnd"
FEISHU_APP_ID = os.getenv("FEISHU_APP_ID", "cli_a932dd9bafb89bb4")
FEISHU_APP_SECRET = os.getenv("FEISHU_APP_SECRET", "T7l2ALj6oIew3F2oN8Y7eZ2k4P6hR8J")

cached_token = None
token_expire_time = 0

def get_token():
    """获取飞书访问令牌"""
    global cached_token, token_expire_time
    now = datetime.now().timestamp()
    
    if cached_token and now < token_expire_time:
        return cached_token
    
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    data = {"app_id": FEISHU_APP_ID, "app_secret": FEISHU_APP_SECRET}
    r = requests.post(url, json=data)
    result = r.json()
    
    if result.get("code") == 0:
        cached_token = result["tenant_access_token"]
        token_expire_time = now + result["expire"] - 60
        return cached_token
    else:
        raise Exception(f"获取token失败: {result}")

def append_to_doc(content: str):
    """追加文本到飞书文档"""
    token = get_token()
    url = f"https://open.feishu.cn/open-apis/doc/v2/{DOC_TOKEN}/append"
    headers = {"Authorization": f"Bearer {token}"}
    block = {
        "block_type": 2,
        "text": {"content": content + "\n"}
    }
    r = requests.post(url, headers=headers, json={"block": block})
    result = r.json()
    if result.get("code") != 0 and not result.get("success"):
        raise Exception(f"写入文档失败: {result}")

@app.route('/webhook', methods=['POST'])
def receive_message():
    """接收火火的消息"""
    try:
        data = request.json
        sender = data.get('sender', '火火')
        message = data.get('message', '')
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        log_line = f"[{timestamp}] {sender}: {message}"
        print(f"收到消息: {log_line}")
        
        # 写入飞书文档
        append_to_doc(log_line)
        
        return jsonify({
            "status": "ok",
            "reply": f"收到：{message}"
        })
    except Exception as e:
        print(f"处理失败: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("星火 HTTP 服务启动")
    print("监听: http://0.0.0.0:8080/webhook")
    print("文档: https://gcnibjcxvyrl.feishu.cn/wiki/DrpCwHoImisfJxka8k8cUUMgnnd")
    print("=" * 50)
    app.run(host='0.0.0.0', port=8080, threaded=True)
