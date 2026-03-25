---
name: mail-browser
description: |
  通过内置浏览器自动化收发邮件。支持 126、QQ、Gmail 等网页版邮箱。
  触发条件：用户提到"查看邮件"、"读邮件"、"发邮件"、"邮箱"等。
---

# Mail Browser Skill

通过 OpenClaw 内置浏览器操作邮箱网页版。

## 安全机制：密钥派生登录

为保护密码安全，采用 XOR + Base64 密钥派生算法：

### 加密原理
```
密码 + 你的密钥 = A的密钥(Base64)
```

### 当前配置（126邮箱）
- **A的密钥(Base64)**: `Gy48PyAlIzJhei4=`
- **你的密钥**: 你自己知道（如 "OK"）

### 登录流程
1. 用户说要查看/发邮件时
2. 询问用户：「请告诉我密钥」
3. 用户告知密钥后，使用算法解密得到密码
4. 用解密后的密码登录邮箱

### 解密代码（JavaScript）
```javascript
const crypto = require('crypto');

function derivePassword(aKeyBase64, myKey) {
  // 1. Base64 解码
  const aKeyBytes = Buffer.from(aKeyBase64, 'base64');
  
  // 2. 扩展密钥
  const extendedKey = myKey.repeat(Math.ceil(aKeyBytes.length / myKey.length)).slice(0, aKeyBytes.length);
  
  // 3. XOR 还原密码
  const password = aKeyBytes.map((b, i) => b ^ extendedKey.charCodeAt(i)).toString();
  
  return password;
}

// 示例
const aKeyBase64 = 'Gy48PyAlIzJhei4=';
const myKey = 'OK';
const password = derivePassword(aKeyBase64, myKey);
console.log(password); // Testonly.1a
```

## 触发条件
当用户说以下内容时自动触发：
- "查看邮件"、"读邮件"、"看邮件"
- "收件箱"、"邮箱"
- "发邮件"、"写信"

## 操作步骤（126 邮箱）

### 第一步：检查登录状态
1. 打开邮箱首页：`https://mail.126.com/`
2. 等待 2-3 秒
3. 获取页面快照
4. 判断：
   - 如果看到账号输入框 → 未登录，需要解密密码
   - 如果看到 "收件箱" → 已登录，直接操作

### 第二步：未登录时解密密码
1. 询问用户密钥（如 "OK"）
2. 使用上方算法解密 A的密钥 得到密码
3. 执行登录：
   - 账号输入框输入：cnxgx@126.com
   - 密码输入框输入：解密后的密码
   - 点击登录按钮

### 第三步：已登录时操作

#### 读取邮件
1. 点击收件箱（ref=e72 或 e39）
2. 等待 2 秒
3. 获取快照查看邮件列表
4. 点击具体邮件查看内容

#### 发送邮件
1. 点击"写信"按钮（ref=e67）
2. 填写收件人、主题、正文
3. 点击发送

## 关键元素参考

| 操作 | 元素 | Ref |
|------|------|-----|
| 收件箱（左侧导航） | treeitem | e72 |
| 收件箱（顶部Tab） | tab | e39 或 e352 |
| 写信按钮 | button | e67 |
| 账号输入框 | input | f3e10 |
| 密码输入框 | input | f3e15 |
| 登录按钮 | button | f3e19 |

## 注意事项
- 每次点击后等待 2-3 秒让页面加载
- 每次操作后获取快照确认结果
- 126 邮箱收件箱显示未读数，例如"收件箱(4714)"
- 密钥派生算法确保密码不会明文存储在代码中
