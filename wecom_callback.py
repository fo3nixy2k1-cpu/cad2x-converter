#!/usr/bin/env python3
"""
企业微信回调接收服务
用于接收企业微信群消息并转发到OpenClaw

运行方式: python wecom_callback.py
需要先安装: pip install flask pycryptodome requests
"""

from flask import Flask, request, jsonify
import hashlib
import time
import json
import base64
import struct
import socket
import threading
from urllib.parse import parse_qs
import requests

app = Flask(__name__)

# ==================== 配置区域 ====================
# 在企业微信后台配置时填写这些值
# Token: 自定义字符串，如 "MyToken123"
# EncodingAESKey: 43位字符，企业微信自动生成，如 "abc123xyz..."
# CorpID: 企业ID，如 "ww1234567890"
# AgentID: 应用ID，如 "1000001"
CONFIG = {
    "token": "YourTokenHere",
    "encoding_aes_key": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnop",
    "corp_id": "wwYourCorpID",
    "agent_id": "1000001",
}

# OpenClaw消息接收配置
OPENCLAW_WEBHOOK = "http://127.0.0.1:8000/message"  # 本地OpenClaw webhook
# ==================== 配置结束 ====================


class WxCrypto:
    """企业微信消息解密"""
    
    def __init__(self, token, encoding_aes_key, corp_id):
        self.token = token
        self.corp_id = corp_id
        
        # EncodingAESKey 是43位Base64字符，需要补足 = 后再解码
        # 43字符 + 1个 = 正好是64字符Base64
        try:
            # 先尝试直接解码
            self.aes_key = base64.b64decode(encoding_aes_key)
        except:
            # 尝试添加一个 = 后解码
            try:
                self.aes_key = base64.b64decode(encoding_aes_key + "=")
            except:
                # 再尝试添加两个 =
                self.aes_key = base64.b64decode(encoding_aes_key + "==")
    
    def verify_signature(self, signature, timestamp, nonce, echostr=None):
        """验证签名"""
        sort_list = sorted([self.token, timestamp, nonce])
        if echostr:
            sort_list.append(echostr)
        
        join_str = "".join(sort_list)
        calc_signature = hashlib.sha1(join_str.encode('utf-8')).hexdigest()
        
        return calc_signature == signature
    
    def decrypt(self, encrypt_msg):
        """解密消息"""
        try:
            from Crypto.Cipher import AES
            
            cipher = AES.new(self.aes_key, AES.MODE_CBC, self.aes_key[:16])
            
            encrypted = base64.b64decode(encrypt_msg)
            decrypted = cipher.decrypt(encrypted)
            
            # 去除PKCS7填充
            pad = decrypted[-1]
            content = decrypted[:-pad]
            
            # 解析XML
            xml_content = content[16:].decode('utf-8')
            
            import xml.etree.ElementTree as ET
            root = ET.fromstring(xml_content)
            
            msg = {
                "to_user": root.find("ToUserName").text if root.find("ToUserName") is not None else "",
                "from_user": root.find("FromUserName").text if root.find("FromUserName") is not None else "",
                "create_time": root.find("CreateTime").text if root.find("CreateTime") is not None else "",
                "msg_type": root.find("MsgType").text if root.find("MsgType") is not None else "",
                "content": root.find("Content").text if root.find("Content") is not None else "",
                "msg_id": root.find("MsgId").text if root.find("MsgId") is not None else "",
                "agent_id": root.find("AgentID").text if root.find("AgentID") is not None else "",
                "xml_raw": xml_content
            }
            
            return msg, "ok"
            
        except Exception as e:
            return None, f"decrypt error: {str(e)}"
    
    def encrypt(self, reply_msg):
        """加密消息"""
        try:
            from Crypto.Cipher import AES
            import random
            
            # 随机16字节
            random_str = str(random.randint(1000000000000000, 9999999999999999))
            
            # 构造XML
            xml_content = f"""<xml>
<ToUserName><![CDATA[{self.corp_id}]]></ToUserName>
<FromUserName><![CDATA[]]></FromUserName>
<CreateTime>{int(time.time())}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[{reply_msg}]]></Content>
</xml>"""
            
            # 填充
            length = len(xml_content)
            pad_len = 32 - (length % 32)
            xml_content += chr(pad_len) * pad_len
            
            # 加密
            cipher = AES.new(self.aes_key, AES.MODE_CBC, self.aes_key[:16])
            encrypted = cipher.encrypt(xml_content.encode('utf-8'))
            
            # Base64编码
            return base64.b64encode(encrypted).decode('utf-8')
            
        except Exception as e:
            return None


# 全局解密对象
crypto = None


def init_crypto():
    """初始化加密对象"""
    global crypto
    crypto = WxCrypto(
        CONFIG["token"],
        CONFIG["encoding_aes_key"],
        CONFIG["corp_id"]
    )


def send_to_openclaw(msg):
    """转发消息到OpenClaw"""
    try:
        # 构建OpenClaw消息格式
        openclaw_msg = {
            "channel": "wecom",
            "msg_type": msg.get("msg_type", "text"),
            "content": msg.get("content", ""),
            "from_user": msg.get("from_user", ""),
            "msg_id": msg.get("msg_id", ""),
        }
        
        response = requests.post(OPENCLAW_WEBHOOK, json=openclaw_msg, timeout=10)
        print(f"已转发消息到OpenClaw: {msg.get('content', '')[:50]}...")
        return True
    except Exception as e:
        print(f"转发失败: {e}")
        return False


@app.route("/wecom/callback", methods=["GET", "POST"])
def callback():
    """企业微信回调入口"""
    
    if request.method == "GET":
        # 验证URL - 企业微信首次配置时会GET请求验证
        msg_signature = request.args.get("msg_signature", "")
        timestamp = request.args.get("timestamp", "")
        nonce = request.args.get("nonce", "")
        echostr = request.args.get("echostr", "")
        
        # 验证签名
        if crypto and crypto.verify_signature(msg_signature, timestamp, nonce, echostr):
            # 解密echostr
            result, status = crypto.decrypt(echostr)
            if status == "ok":
                return result if result else echostr
            else:
                # 简单模式：直接返回
                return echostr
        else:
            return "signature error"
    
    else:
        # 接收消息 - POST请求
        msg_signature = request.args.get("msg_signature", "")
        timestamp = request.args.get("timestamp", "")
        nonce = request.args.get("nonce", "")
        
        # 获取加密消息体
        encrypt_msg = request.data.decode('utf-8')
        
        # 简单解析（如果不验证签名）
        # 实际应该验证签名后再解密
        
        try:
            # 尝试解密
            if crypto:
                msg, status = crypto.decrypt(encrypt_msg)
                if status == "ok":
                    print(f"收到消息: {msg['msg_type']} - {msg.get('content', '(无文本内容)')[:50]}")
                    
                    # 转发到OpenClaw（异步）
                    threading.Thread(target=send_to_openclaw, args=(msg,)).start()
                    
                    return "success"
            
            # 如果解密失败，尝试直接解析XML
            import xml.etree.ElementTree as ET
            root = ET.fromstring(encrypt_msg)
            
            msg = {
                "to_user": root.find("ToUserName").text if root.find("ToUserName") is not None else "",
                "from_user": root.find("FromUserName").text if root.find("FromUserName") is not None else "",
                "create_time": root.find("CreateTime").text if root.find("CreateTime") is not None else "",
                "msg_type": root.find("MsgType").text if root.find("MsgType") is not None else "text",
                "content": root.find("Content").text if root.find("Content") is not None else "",
                "msg_id": root.find("MsgId").text if root.find("MsgId") is not None else "",
                "agent_id": root.find("AgentID").text if root.find("AgentID") is not None else "",
            }
            
            print(f"收到消息(明文): {msg['msg_type']} - {msg.get('content', '')[:50]}")
            
            # 转发到OpenClaw
            threading.Thread(target=send_to_openclaw, args=(msg,)).start()
            
            return "success"
            
        except Exception as e:
            print(f"解析消息失败: {e}")
            return "success"  # 仍返回success避免企业微信重试


@app.route("/health")
def health():
    """健康检查"""
    return jsonify({"status": "ok", "service": "wecom-callback"})


@app.route("/")
def index():
    """首页"""
    return jsonify({
        "service": "企业微信回调服务",
        "status": "running",
        "config": {
            "corp_id": CONFIG["corp_id"],
            "agent_id": CONFIG["agent_id"]
        }
    })


if __name__ == "__main__":
    init_crypto()
    
    print("=" * 50)
    print("企业微信回调服务启动")
    print(f"监听端口: 8080")
    print(f"回调URL: http://你的域名:8080/wecom/callback")
    print("=" * 50)
    
    app.run(host="0.0.0.0", port=8080, debug=False, threaded=True)
