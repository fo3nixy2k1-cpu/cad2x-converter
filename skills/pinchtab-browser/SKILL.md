# PinchTab Browser Skill

使用 PinchTab (127.0.0.1:9867) 进行浏览器自动化操作。

## 何时使用

- 用户要求浏览网页、抓取内容、填表、点击等浏览器操作时
- 需要浏览器自动化（navigation、snap、screenshot、click、fill 等）

## 前提检查

使用前先确认 PinchTab 服务正在运行：

```bash
pinchtab health
```

如果返回 `connect: refused`，需要启动服务：

```bash
Start-Process -FilePath "C:\Users\y2k1\pinchtab.exe" -ArgumentList "server" -NoNewWindow
Start-Sleep 3
```

## 核心操作

### 导航
```bash
pinchtab nav <URL>
```

### 页面快照（可交互元素）
```bash
pinchtab snap
```

### 截图
```bash
pinchtab screenshot
```

### 截图（文件）
```bash
pinchtab screenshot -o <output_path>
```

### 点击元素
```bash
pinchtab click <ref>  # ref 从 snap 获取，如 e5
```

### 填表单
```bash
pinchtab fill <ref> "<text>"
```

### 键盘按键
```bash
pinchtab press <key>  # 如 Enter, Tab, Escape
```

### 输入文本
```bash
pinchtab type <ref> "<text>"
```

### 提取文本（Token 高效，~800 tokens vs 10000+）
```bash
pinchtab text
```

### 等待
```bash
pinchtab wait <condition>  # 等待元素、文本、URL、网络空闲等
```

### PDF 导出
```bash
pinchtab pdf -o <output.pdf>
```

### JS 执行（危险功能，默认关闭）
> 需要 `security.allowEvaluate = true` 才可用

## API 调用（通过 Node.js）

如需程序化调用，基础 HTTP 请求格式：

```
http://127.0.0.1:9867/<endpoint>
Authorization: Bearer <token>
```

Token（见 TOOLS.md）：`4ff6bcf0652f3c2f91596e55c10029c469a218547df425f0`

### 通过 curl 调用
```bash
curl -H "Authorization: Bearer <token>" http://127.0.0.1:9867/health
curl -H "Authorization: Bearer <token>" http://127.0.0.1:9867/navigate -X POST -d '{"url":"https://..."}'
```

## 错误处理

| 错误 | 原因 | 解决 |
|------|------|------|
| `connect: refused` | 服务未启动 | 启动 `pinchtab server` |
| `403 blocked private IP` | IDPI 限制 | 检查 `security.idpi.enabled` 和 `allowedDomains` |
| `401 unauthorized` | Token 缺失或错误 | 检查 Token 配置 |

## IDPI 安全配置

默认只允许本地网站。访问公网需要修改配置：

```json
{
  "security": {
    "idpi": {
      "enabled": true,
      "allowedDomains": ["*"],
      "strictMode": false
    }
  }
}
```

配置文件：`C:\Windows\system32\config\systemprofile\AppData\Roaming\pinchtab\config.json`
