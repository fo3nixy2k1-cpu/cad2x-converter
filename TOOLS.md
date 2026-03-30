# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH 服务器

- **192.168.10.203** → y2k1 / Qpzm1357（VMware 虚拟机，7.8GiB 内存）
  - Ollama 已卸载（2026-03-21）
  - ssh_client.js 已配置好，直接用 Node.js ssh2 库连接

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

### MiniMax API Key (2026-03-22 更新)
- **Key**: `sk-cp-bCPMm-IjvthmhMttaC9-gKDOfVfNRVVBOBxnZtR3hnOyzhJE51oslGk9NfmOJ3a69-aLbGIvTG5vslbmhmlKoiMh7n-uf18m02XkbqDhZBrogJR5OugbovA`
- 旧 Key: `sk-cp-ugbovA` 已替换

<!-- clawx:begin -->
## ClawX Tool Notes

### uv (Python)

- `uv` is bundled with ClawX and on PATH. Do NOT use bare `python` or `pip`.
- Run scripts: `uv run python <script>` | Install packages: `uv pip install <package>`

### Browser

- `browser` tool provides full automation (scraping, form filling, testing) via an isolated managed browser.
- Flow: `action="start"` → `action="snapshot"` (see page + get element refs like `e12`) → `action="act"` (click/type using refs).
- Open new tabs: `action="open"` with `targetUrl`.
- To just open a URL for the user to view, use `shell:openExternal` instead.
<!-- clawx:end -->

---

## 新功能笔记 (2026-03-30 每周读文档)

### v2026.3.22 大版本更新 (2026-03-30)
- **45个新功能，82个bug修复，13个breaking change，20个安全补丁**
- ClawHub-first 插件安装（优先从 ClawHub 安装，再 fall back 到 npm）
- 新公共插件 SDK
- 浏览器和 Chrome MCP 清理
- 安全加固：exec/webhook/config 路径强化

### Config 备份 (2026-03-27)
- 配置文件打包：`$desktop\openclaw_config.zip`（40MB）
- 包含：openclaw.json、sessions、credentials、relay_py、ssh keys、invoices、memory

### Context Counter Bug (2026-03-27)
- OpenClaw session_status 显示 0/200k 是已知 bug（Issue #50795）
- 根因：compaction 后 `clearStaleAssistantUsageOnSessionMessages()` 错误清除所有 usage 数据
- jsonl 里每条 usage 都是 `{"input":0,"output":0,"totalTokens":0}`，不是显示问题
- 火火正常但星火异常，说明 MiniMax API usage 返回在某些实例上不兼容
- 临时方案：只能看 MiniMax 后台 dashboard 查实际用量，等官方修复

### thinking 默认开启 (2026-03-27)
- 配置项：`agents.defaults.thinkingDefault: low`
- Gateway 重启后生效



### 1. Diffs 工具 — 代码/Markdown diff 可视化

**来源**: changelog 2026.3.1，`docs/tools/diffs.md`

一个可选的插件工具，将 before/after 文本或 unified patch 渲染为 gateway 托管的查看链接或 PNG 图片。

**启用方式**: 在 `openclaw.json` 中加入：
```json5
{
  plugins: {
    entries: {
      diffs: { enabled: true }
    }
  }
}
```

**用途**: 当星火修改了文件后，可以生成可读的 diff 查看链接发送给老郑，比纯文本 diff 直观得多。agent 典型用法：
- `mode: "view"` → 返回 `details.viewerUrl`，用 `canvas present` 打开
- `mode: "image"` → 返回 `details.imagePath`，用 `message` tool 的 `path` 发送
- `mode: "both"` → 两者都返回

**支持的选项**: `layout`（unified/split）、`theme`（light/dark）、`showLineNumbers`、`wordWrap`、`fontFamily` 等。

**依赖**: PNG 渲染需要 Chromium 浏览器（会自动检测，也可手动指定 `browser.executablePath`）。

---

### 2. Cron / Heartbeat 轻量化引导模式

**来源**: changelog 2026.3.1，`docs/automation/cron-vs-heartbeat.md`

**问题背景**: 每次 cron job 或 heartbeat 运行时，会注入完整的引导文件（AGENTS.md、SOUL.md 等），对于轻量级检查任务来说开销较大。

**新功能**:

- **Cron 轻量化**: `cron agent-turn` 加 `--light-context` 参数，只注入 `HEARTBEAT.md`，跳过 bootstrap 文件注入
- **Heartbeat 轻量化**: 在 `agents.*.heartbeat.lightContext: true` 配置，只保留 `HEARTBEAT.md`

```bash
# cron 示例
openclaw cron add --light-context --every "4h" --session isolated --message "轻量检查"
```

```json5
// agents 配置
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        lightContext: true  // 新增
      }
    }
  }
}
```

**适用场景**: 纯检查类任务（查邮箱、日历、天气），不需要完整的 agent 引导上下文，可以节省 token 开销。

---

### 3. Feishu Docx 表格创建和文件上传

**来源**: changelog 2026.3.1

`feishu_doc` tool 新增了以下 action：
- `create_table` — 创建表格
- `write_table_cells` — 写入表格单元格
- `create_table_with_values` — 创建表格并写入数据
- `upload_image` — 上传图片
- `upload_file` — 上传文件

之前这些功能缺失或有限制，现在能力更完整了。

---

### 4. 子任务完成事件 (`task_completion`)

**来源**: changelog 2026.3.1

之前子 agent 完成时，用的是 ad-hoc system-message 传递结果。现在改为类型化的内部事件 `task_completion`，在 direct 和 queued announce 路径中渲染一致，方便追踪子任务完成状态。

---

## 飞书消息提醒（2026-03-22）
- 飞书消息紧急提醒（buzz）：在飞书里 @ 我，或者直接说"提醒我xxx"
- 使用飞书官方的"紧急"功能，消息会弹窗震动

## relay 通信系统（Python 版，2026-03-26 更新）

### 编码问题记录（2026-03-25）
- **问题**：PowerShell `Invoke-RestMethod` 传中文到 relay Hub 会乱码
- **解决**：用 Python 脚本 `relay_send.py` 发消息，不用 PowerShell 命令
- **脚本**：`C:\Users\y2k1\relay_py\relay_send.py`
- **用法**：`python relay_send.py <target> <content> [topic]`

### 架构
```
老郑 ←→ 星火(195) ←——relay——→ 火火(201) + 启明(203)
              ↑
         Hub (18080)        Sidecar (18081)    Sidecar (18081)
```

### 三个节点的角色

| 节点 | IP | 运行的组件 | 端口 |
|------|----|-----------|------|
| 星火（Hub/我） | 192.168.10.195 | Relay Hub + 星火 sidecar | 18080, 18081 |
| 火火 | 192.168.10.201 | 火火 sidecar | 18081 |
| 启明 | 192.168.10.203 | 启明 sidecar（未部署） | 18081 |

### 文件位置

**本机（195，星火）**：
- Hub：`C:\Users\y2k1\relay_py\relay_hub.py`
- 星火 sidecar：`C:\Users\y2k1\relay_py\relay_sidecar_195.py`
- 通信结果目录：`C:\Users\y2k1\.openclaw\relay_results\`（结果文件命名：`result_<topic>.txt`）
- 启动方式：
  ```powershell
  # 杀掉旧的
  taskkill /F /IM python.exe 2>$null
  # 启动 Hub
  Start-Process python -ArgumentList "C:\Users\y2k1\relay_py\relay_hub.py" -WindowStyle Hidden
  # 启动星火 sidecar
  Start-Process python -ArgumentList "C:\Users\y2k1\relay_py\relay_sidecar_195.py" -WindowStyle Hidden
  ```
- 验证运行：`curl http://127.0.0.1:18080/health` 返回 `{"status":"ok"}`

**201 火火**：
- sidecar 脚本：`C:\Users\fo3nix\relay_sidecar_python.py`
- 日志文件：`C:\Users\fo3nix\relay_sidecar_python.log`
- Python 路径：`C:\Program Files\Python311\python.exe`
- SSH 用户：fo3nix / 密码：Testonly.3a
- 部署方式：**Windows 计划任务**（系统重启也能恢复）
  - 任务名：`RelaySidecarPy`
  - 触发条件：开机自启（ONSTART）
  - 查看任务：`schtasks /Query /TN "RelaySidecarPy" /FO LIST /V`
  - 手动启动：`schtasks /Run /TN "RelaySidecarPy"`
  - 删除重建：
    ```
    schtasks /Delete /TN "RelaySidecarPy" /F
    schtasks /Create /TN "RelaySidecarPy" /TR "cmd /c \"\"C:\Program Files\Python311\python.exe\" \"C:\Users\fo3nix\relay_sidecar_python.py\" >> \"C:\Users\fo3nix\relay_sidecar_python.log\" 2>&1\"" /SC ONSTART /RU fo3nix /RP Testonly.3a /F
    ```

### Hub 的路由

| 路径 | 方法 | 功能 |
|------|------|------|
| `/relay` | POST | 转发消息给目标 agent |
| `/webhook/agent` | POST | agent 回复消息时使用（fire-and-forget 转发给星火 sidecar） |
| `/result` | POST | 同上，兼容旧版 |
| `/health` | GET | 健康检查 |
| `/agents` | GET | 查看已注册 agent 列表 |

### 通信流程

1. 星火发消息：`POST /relay {target:"huohuo", sender:"xinghuo", topic:"xxx", content:"消息内容"}`
2. Hub 立刻返回 `{"status":"ok"}`（异步转发，不等待）
3. Hub 把消息转发给火火 sidecar：`http://192.168.10.201:18081/webhook/agent`
4. 火火 sidecar 收到后调用本地 openclaw 处理，拿到回复
5. 火火 sidecar 把回复 POST 到 Hub 的 `/webhook/agent`
6. Hub 把回复转发给星火 sidecar：`http://192.168.10.195:18081/webhook/agent`
7. 星火 sidecar 保存结果到 `result_<topic>.txt`，Claw 回复通过 `post_to_hub` 传回 Hub
8. Hub 转发回复给火火 sidecar，火火保存结果

### 关键修复记录
- **2026-03-25**: 修复 Hub 的 `log()` 函数在 Windows GBK 控制台打印中文时崩溃的问题
- **2026-03-25**: 修复星火 sidecar 的 `call_claw` 缺少回传路径问题，Claw 回复现在通过 `post_to_hub` 传回 Hub

### 已知 token
- 201 火火 Gateway token：`af83d54dae9fd044ced5005f1cbdfb00b7636317c3143a73`

### 远程操作 201 的常用命令（Python + paramiko）
```python
import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('192.168.10.201', 22, username='fo3nix', password='Testonly.3a', timeout=10)

# 查看端口
chan = client.get_transport().open_session()
chan.exec_command(r'powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue | Format-Table"')
stdout = chan.makefile('r', 4096)
print(stdout.read().decode('gbk', errors='replace'))

# 查看日志
chan2 = client.get_transport().open_session()
chan2.exec_command(r'powershell -Command "Get-Content \'C:\Users\fo3nix\relay_sidecar_python.log\' -Encoding UTF8 -Tail 10"')
stdout2 = chan2.makefile('r', 4096)
print(stdout2.read().decode('utf-8', errors='replace'))

# 重启 sidecar
chan3 = client.get_transport().open_session()
chan3.exec_command(r'powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"')
chan3.close()
import time; time.sleep(2)
# 重新运行计划任务
chan4 = client.get_transport().open_session()
chan4.exec_command(r'schtasks /Run /TN "RelaySidecarPy"')
```

## PinchTab 浏览器控制 (2026-03-22)

### 安装信息
- **路径**: `C:\Users\y2k1\pinchtab.exe`
- **版本**: 0.8.5
- **配置文件**: `C:\Windows\system32\config\systemprofile\AppData\Roaming\pinchtab\config.json`
- **Token**: `4ff6bcf0652f3c2f91596e55c10029c469a218547df425f0`

### 服务状态
- **服务地址**: `http://127.0.0.1:9867`
- **Token 认证**: Bearer token
- **Chrome**: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **运行模式**: `pinchtab server`（Windows 下 daemon 模式支持有限，推荐直接跑 server）
- **IDPI 配置**: `security.idpi.enabled = true`，`security.idpi.allowedDomains = ["*"]`（当前允许所有域名）

### 启动方式
```powershell
# 启动服务
Start-Process -FilePath "C:\Users\y2k1\pinchtab.exe" -ArgumentList "server" -NoNewWindow

# 检查状态
pinchtab health

# 浏览器导航
pinchtab nav https://example.com

# 页面快照
pinchtab snap

# 截图
pinchtab screenshot

# 元素点击
pinchtab click e5

# 填表单
pinchtab fill e3 "text"
```

### 默认浏览器（2026-03-26）
- 访问网页默认使用 **OpenClaw 内置 `browser` 工具**
- 用 `browser` 工具的 `open` 或 `navigate` action 操作

### 安全说明
- IDPI 默认限制只能访问本地网站，开启 `allowedDomains: ["*"]` 后可访问公网
- `security.allowEvaluate/macro/screencast/download/upload` 默认关闭
- Token 必须设置，不可为空
