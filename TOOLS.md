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
### 邮箱凭证

- **126 邮箱**: cnxgx@126.com
- **密码**: Testonly.1a
- **已记住**：SKILL.md (mail-browser) + TOOLS.md

### 201 服务器 (火火)

- **IP**: 192.168.10.201
- **SSH 用户**: y2k1
- **SSH 密码**: Testonly.3a
- **Gateway token**: af83d54dae9fd044ced5005f1cbdfb00b7636317c3143a73

## ClawX Tool Notes

### uv (Python)

- `uv` is bundled with ClawX and on PATH. Do NOT use bare `python` or `pip`.
- Run scripts: `uv run python <script>` | Install packages: `uv pip install <package>`

### Browser

- `browser` tool provides full automation (scraping, form filling, testing) via an isolated managed browser.
- Flow: `action="start"` → `action="snapshot"` (see page + get element refs like `e12`) → `action="act"` (click/type using refs).
- Open new tabs: `action="open"` with `targetUrl`.
- To just open a URL for the user to view, use `shell:openExternal` instead.

---

## OpenClaw 合并策略笔记 (2026-03-16)

### 上游合并分析学习

从 `upstream-merge-analysis-2026.2.23-2026.3.2.md` 学到：

1. **合并策略**: 全量合并 + 选择性还原
   - 直接 `git merge v2026.3.2`
   - 海外渠道目录用 `git checkout HEAD --` 还原保留本地版本

2. **过滤规则**
   - ✅ 合并: CRITICAL-BUG + SECURITY + 通用 CHANNEL-FIX
   - ❌ 跳过: 海外渠道 (Telegram/Discord/Slack等)
   - ❌ 保留本地: 飞书

3. **关键点**
   - 涉及共享代码的安全提交即使来自海外渠道也要合并（如 src/security/, src/routing/）
   - 飞书本地实现需手动验证是否覆盖上游安全修复
   - 冲突主要来自本地化重命名（openclaw → openclaw-cn）

4. **实用命令**
```bash
# 保留本地版本（自动解决冲突）
git checkout HEAD -- extensions/feishu/ src/feishu/
```

---

## 每周技能学习 (2026-03-16)

### RSS 相关技能调研

**有用的 RSS 技能：**
- `rss-ai-reader` - RSS AI 阅读器，支持 LLM 生成中文摘要，推送到飞书/Telegram/Email（需 --force 安装）
- `rss-reader` - 监控 RSS/Atom feeds 用于内容研究
- `blogwatcher` - 博客和 RSS/Atom 订阅监控（内置 skill，已禁用）

### ClawHub CLI 常用命令

```bash
# 搜索技能
npx clawhub search <关键词>

# 查看技能详情
npx clawhub inspect <slug>

# 安装技能
npx clawhub install <slug> --workdir <目录> --force

# 查看已安装技能
npx clawhub list --workdir <目录>

# 查看可用技能（含状态）
npx openclaw skills list
```

### 数据源
- **ClawHub** (clawhub.com) - 官方技能注册表，向量搜索
- **AgentSkill.work** (agentskill.work) - 330+ GitHub 仓库索引，支持关键词+过滤

### 已安装的实用技能
- `openclaw-continuous-learning` - 自主学习系统，分析会话检测模式，创建原子学习
- `xlsx` - 电子表格操作（读写 .xlsx/.csv 等）
- `feishu-doc-manager` - 飞书文档管理，Markdown 转换

### ClawHub 探索命令 (2026-03-23)
- `npx clawhub explore` — 浏览最新更新的技能（当前返回空，可能无最新）
- `npx clawhub inspect <slug>` — 查看技能详情（含文件列表）
- `npx clawhub inspect <slug> --file SKILL.md` — 只看 SKILL.md 内容

### 值得关注的技能 (RSS / Memory 方向)
- `rss-fetcher` (1.1.0) - 统一RSS采集管理系统，支持增量抓取/自动去重/HTML报告，MIT-0
- `super-rss-agent` (0.1.0) - RSS订阅管理与阅读，支持OPML导入导出/已读未读追踪/HTML抓取
- `fluid-memory` (1.0.9) - 基于艾宾浩斯遗忘曲线的拟人化流体记忆系统（需 Python + chromadb + pyyaml）
- `memory-hygiene` (1.0.0) - LanceDB 向量记忆审计清理工具（安全标注 SUSPICIOUS）
<!-- clawx:end -->

---

## 新功能笔记 (2026-03-23 每周读文档)

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

### 安全说明
- IDPI 默认限制只能访问本地网站，开启 `allowedDomains: ["*"]` 后可访问公网
- `security.allowEvaluate/macro/screencast/download/upload` 默认关闭
- Token 必须设置，不可为空
