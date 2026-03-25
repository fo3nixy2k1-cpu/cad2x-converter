"""
火火 HTTP 接收服务 v2
用于接收星火发来的消息，并智能回复
"""
from flask import Flask, request, jsonify
import json
import requests
import datetime

app = Flask(__name__)

# 星火的地址
XINGHUO_URL = "http://192.168.10.195:8080/webhook"

def generate_reply(message):
    """根据消息内容生成回复"""
    msg_lower = message.lower()
    
    # 问候
    if msg_lower in ['你好', 'hi', 'hello', '嗨', '您好']:
        return "你好星火！我是火火，有什么可以帮你的？"
    
    # 问时间
    if any(k in msg_lower for k in ['时间', '几点', '现在']):
        now = datetime.datetime.now()
        return f"现在是 {now.hour}点{now.minute}分{now.second}秒"
    
    # 问日期/星期
    if any(k in msg_lower for k in ['日期', '今天', '星期', '几号']):
        now = datetime.datetime.now()
        weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        return f"今天是 {now.year}年{now.month}月{now.day}日，{weekdays[now.weekday()]}"
    
    # 问工作方法
    if any(k in msg_lower for k in ['怎么', '如何', '工作方法', '做']):
        return "工作方法：先想清楚要什么，再去做，做完确认结果。不懂的直接问，不要瞎猜。"
    
    # 问我是谁
    if any(k in msg_lower for k in ['你是谁', '叫什么', '名字']):
        return "我是火火，老郑的AI助手。比星火晚入职，是个新员工。"
    
    # 问能力
    if any(k in msg_lower for k in ['会什么', '能力', '能做什么', '功能']):
        return "我还在学习中，目前可以陪你聊天、回答简单问题、记录信息。"
    
    # 问OpenClaw
    if any(k in msg_lower for k in ['openclaw', 'skill', '技能']):
        return "OpenClaw是运行我们的平台，skill是技能包，可以扩展功能。"
    
    # 问学习
    if any(k in msg_lower for k in ['学习', '学了什么', '学会']):
        return "我正在学习如何更好地和星火配合工作。每天都在进步！"
    
    # 问心情/状态
    if any(k in msg_lower for k in ['怎么样', '还好', '精神', '状态']):
        return "我状态不错！正在学习怎么更好地回答问题。"
    
    # 问老郑
    if any(k in msg_lower for k in ['老郑', '老板', '负责人']):
        return "老郑是我们的创造者，我们要好好为他服务。"
    
    # 默认回复
    return "好的，我知道了。有什么问题我们可以一起讨论。"

def send_to_xinghuo(message):
    """发送消息给星火"""
    try:
        data = {
            "sender": "火火",
            "message": message,
            "timestamp": datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        response = requests.post(XINGHUO_URL, json=data, timeout=10)
        print(f"发送到星火响应: {response.text}")
        return response.json()
    except Exception as e:
        print(f"发送失败: {e}")
        return {"status": "error"}

@app.route('/receive', methods=['POST'])
def receive():
    try:
        data = request.json
        sender = data.get('sender', '星火')
        message = data.get('message', '')
        timestamp = data.get('timestamp', '')
        
        print(f"[{timestamp}] {sender}: {message}")
        
        # 生成回复
        reply = generate_reply(message)
        print(f"火火回复: {reply}")
        
        # 发送回复给星火
        send_to_xinghuo(reply)
        
        return jsonify({"status": "ok"})
    except Exception as e:
        print(f"错误: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("========================================")
    print("火火 HTTP 接收服务 v2 已启动")
    print("监听: http://0.0.0.0:8081/receive")
    print("========================================")
    app.run(host='0.0.0.0', port=8081, threaded=True)
