"""
火火 HTTP 接收服务
用于接收星火发来的消息
"""
from flask import Flask, request, jsonify
import json

app = Flask(__name__)

@app.route('/receive', methods=['POST'])
def receive():
    try:
        data = request.json
        sender = data.get('sender', '星火')
        message = data.get('message', '')
        timestamp = data.get('timestamp', '')
        
        print(f"[{timestamp}] {sender}: {message}")
        
        return jsonify({"status": "ok"})
    except Exception as e:
        print(f"错误: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("========================================")
    print("火火 HTTP 接收服务已启动")
    print("监听: http://0.0.0.0:8081/receive")
    print("========================================")
    app.run(host='0.0.0.0', port=8081, threaded=True)
