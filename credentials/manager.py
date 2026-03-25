import os
import json
import base64
from cryptography.fernet import Fernet
from pathlib import Path

CREDENTIALS_DIR = Path(__file__).parent.resolve()
CREDENTIALS_FILE = CREDENTIALS_DIR / "vault.enc"
MASTER_KEY_FILE = CREDENTIALS_DIR / ".key"

def generate_key():
    """生成密钥并保存"""
    key = Fernet.generate_key()
    with open(MASTER_KEY_FILE, 'wb') as f:
        f.write(key)
    return key

def load_key():
    """加载密钥"""
    if not MASTER_KEY_FILE.exists():
        return generate_key()
    with open(MASTER_KEY_FILE, 'rb') as f:
        return f.read()

def encrypt(data: str, key: bytes) -> str:
    """加密数据"""
    f = Fernet(key)
    return base64.b64encode(f.encrypt(data.encode())).decode()

def decrypt(data: str, key: bytes) -> str:
    """解密数据"""
    f = Fernet(key)
    return f.decrypt(base64.b64decode(data.encode())).decode()

def save_credential(name: str, value: str, user_key: str = None):
    """保存凭证（用户提供的密钥）"""
    if not user_key:
        print("Error: need user key")
        return
    
    import hashlib
    key_bytes = hashlib.sha256(user_key.encode()).digest()
    key = base64.urlsafe_b64encode(key_bytes)
    
    encrypted = encrypt(value, key)
    
    vault = {}
    if CREDENTIALS_FILE.exists():
        with open(CREDENTIALS_FILE, 'r') as f:
            vault = json.load(f)
    
    vault[name] = encrypted
    
    with open(CREDENTIALS_FILE, 'w') as f:
        json.dump(vault, f, indent=2)
    
    print(f"[OK] Saved: {name}")

def get_credential(name: str, key: str = None) -> str:
    """获取凭证（需要提供密钥）"""
    if not CREDENTIALS_FILE.exists():
        print(f"[ERR] No saved credentials")
        return None
    
    with open(CREDENTIALS_FILE, 'r') as f:
        vault = json.load(f)
    
    if name not in vault:
        print(f"[OK] Found: {name}")
        return None
    
    # 用户提供密钥解密
    try:
        # 简单密钥处理：用户密钥 + 固定盐
        import hashlib
        key_bytes = hashlib.sha256(key.encode()).digest()
        key_bytes = base64.urlsafe_b64encode(key_bytes)
        
        return decrypt(vault[name], key_bytes)
    except Exception as e:
        print(f"[ERR] Key error: {e}")
        return None

def list_credentials():
    """列出已保存的凭证名称"""
    if not CREDENTIALS_FILE.exists():
        print("No saved credentials")
        return []
    
    with open(CREDENTIALS_FILE, 'r') as f:
        vault = json.load(f)
    
    return list(vault.keys())

# CLI
if __name__ == "__main__":
    import sys
    cmd = sys.argv[1] if len(sys.argv) > 1 else "list"
    
    if cmd == "save":
        name = sys.argv[2]
        value = sys.argv[3]
        user_key = sys.argv[4] if len(sys.argv) > 4 else input("Enter key: ")
        save_credential(name, value, user_key)
    elif cmd == "get":
        name = sys.argv[2]
        user_key = sys.argv[3] if len(sys.argv) > 3 else input("Enter key: ")
        result = get_credential(name, user_key)
        if result:
            print(result)
    elif cmd == "list":
        names = list_credentials()
        print("Saved:", names)
    else:
        print("Usage: python manager.py save <name> <value> <key>")
        print("       python manager.py get <name> <key>")
        print("       python manager.py list")
