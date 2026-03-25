# Gemini 浏览器对话 Skill

通过 PinchTab 控制 Chrome 访问 Gemini 网页，提问并提取回复。

## 前置条件

1. **PinchTab 服务运行中**
2. **Chrome 已安装**且 IDPI 允许 `gemini.google.com`
3. **已登录 Gemini**（手动登录一次，cookie 会保留）

## 核心流程

### 步骤 1：导航到 Gemini
```bash
pinchtab nav https://gemini.google.com
```
等待页面加载（`sleep 5`）

### 步骤 2：获取页面可交互元素
```bash
pinchtab snap
```
找到 `role: textbox` 的元素 ref（输入框）和 `role: button` 的元素 ref（发送按钮）

### 步骤 3：填写问题
```bash
pinchtab fill <输入框ref> "你好 Gemini，请介绍一下你自己"
```

### 步骤 4：点击发送
```bash
pinchtab click <发送按钮ref>
```

### 步骤 5：等待回复（15-20秒）
```bash
sleep 20
```

### 步骤 6：提取 Gemini 回复
```bash
pinchtab text
```
从返回文本中找到 Gemini 的回复部分

## 完整示例

### 测试 Gemini 是否正常

```bash
pinchtab nav https://gemini.google.com
sleep 5
pinchtab text
```

### 问 Gemini 一个问题

```bash
pinchtab nav https://gemini.google.com
sleep 5
pinchtab snap
# 从 snap 结果中找到 e5(输入框) 和 e30(发送按钮)
pinchtab fill e5 "什么是 OpenClaw?"
pinchtab click e30
sleep 15
pinchtab text
```

## HTTP API（Node.js 调用）

```javascript
const http = require('http');
const TOKEN = 'f6b4bb1ed44c47fa3755b93d8b65b78f786c17c6d9c65582';
const PORT = 9867;

function api(method, path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body || {});
    const req = http.request({
      hostname: '127.0.0.1', port: PORT, path, method,
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => resolve({ s: res.statusCode, b: out }));
    });
    req.on('error', e => resolve({ e }));
    if (body) req.write(data);
    req.end();
  });
}

// 使用
await api('POST', '/navigate', { url: 'https://gemini.google.com' });
// await sleep(5000);
// const snap = await api('POST', '/snap', {});
```

## 已知问题

- **CLI nav 返回 ok 但浏览器没反应**：可能是 PinchTab 进程冲突，杀掉所有残留进程后重试
- **HTTP API /snap 卡住**：换用 `GET /text` 提取内容
- **Token 变更**：重启后 token 可能变化，检查 `pinchtab config get server.token`

## 故障排查

```bash
# 1. 检查服务状态
pinchtab health

# 2. 重启服务
# 先杀掉所有残留
Get-Process | Where-Object {$_.ProcessName -like "*inch*"} | Stop-Process -Force
# 再启动
Start-Process -FilePath "C:\Users\y2k1\pinchtab.exe" -ArgumentList "server" -NoNewWindow

# 3. 确认 token
pinchtab config get server.token

# 4. 清理残留端口
netstat -ano | Select-String "9867"
```
