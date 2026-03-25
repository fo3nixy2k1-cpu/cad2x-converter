---
name: relay-system
description: Relay Hub 多智能体通信系统。当用户提到 relay、Relay Hub、三台服务器通信、星火火火启明通信、relay_hub、sidecar、18080、18081 时触发。
---

# Relay Hub 多智能体通信系统

## 架构

```
星火(195) ←→ [Hub:18080] ←→ 启明(203)
                                ↓
                           火火(201)
```

| 节点 | IP | 端口 | SSH | 密码 |
|------|-----|------|-----|------|
| 星火(Hub) | 192.168.10.195 | 18080/18081 | y2k1 | Qpzm1357 |
| 火火 | 192.168.10.201 | 18081 | y2k1 | 问老郑 |
| 启明 | 192.168.10.203 | 18081 | y2k1 | Qpzm1357 |

## 快速操作

### 启动 Hub（本机 195）
```bash
node C:\Users\y2k1\relay_system\relay_hub.js &
node C:\Users\y2k1\relay_system\relay_sidecar.js &
```

### 启动 203 Sidecar（通过 SSH）
```bash
ssh y2k1@192.168.10.203 "cd ~ && nohup node relay_sidecar.js > relay_sidecar.log 2>&1 &"
```

### 检查状态
```bash
# 195
netstat -ano | Select-String "18080|18081"

# 203
ssh y2k1@192.168.10.203 "ss -tlnp | grep 18081"
```

### 发消息给启明/火火
POST http://127.0.0.1:18080/relay
```json
{"sender":"xinghuo","target":"qiming","topic":"task_001","content":"你的指令"}
```

## 详细文档
- 部署流程：references/deploy.md
- 使用说明：references/install.md
