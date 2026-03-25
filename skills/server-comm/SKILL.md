---
name: server-comm
description: |
  启明服务器通信工具包（SSH + 端口检测 + Sidecar 状态）。当用户提到联系201、203、检查服务器、部署脚本时触发。
---

# Server Communication Skill (Python + Paramiko)

## 服务器节点

| 节点 | IP | SSH 用户 | SSH 密码 | 系统 | Sidecar 端口 |
|------|----|---------|---------|------|-------------|
| 201 | 192.168.10.201 | fo3nix | Testonly.3a | Windows | 18081 |
| 203 | 192.168.10.203 | y2k1 | Qpzm1357 | Linux | 18081 |
| 195 | 192.168.10.195 | — | — | Windows（本地） | 18080（Relay Hub） |

## 使用方法

```bash
python ssh_func.py <host> <command> [port] [user] [password]
```

**示例：**
```bash
# 检查 203 内存
python ssh_func.py 192.168.10.203 "free -h && ps aux --sort=-%mem | head -10"

# 检查 201 端口
python ssh_func.py 192.168.10.201 "Get-NetTCPConnection -LocalPort 18081" 22 fo3nix Testonly.3a
```

## 检测 Sidecar 状态

**Windows（201）:**
```powershell
# SSH 连接后执行
powershell -Command "Get-NetTCPConnection -LocalPort 18081 -ErrorAction SilentlyContinue"
powershell -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 18081).OwningProcess -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path,StartTime"
```

**Linux（203）:**
```bash
ss -tlnp | grep 18081
lsof -i :18081
```

**本地 Relay Hub（195）:**
```powershell
powershell -Command "Get-NetTCPConnection -LocalPort 18080 -ErrorAction SilentlyContinue"
```

## 部署 Sidecar

### Windows（201）
1. SFTP 上传 `relay_sidecar.js` → `C:\sidecar\`
2. 启动：`powershell -Command "Start-Process -FilePath node -ArgumentList 'C:\sidecar\relay_sidecar.js' -NoNewWindow -PassThru"`
3. 验证：`powershell -Command "Get-NetTCPConnection -LocalPort 18081"`

### Linux（203）
1. SFTP 上传 `relay_sidecar.js` → `/home/y2k1/sidecar/`
2. 启动：`cd /home/y2k1/sidecar && node relay_sidecar.js &`
3. 验证：`ss -tlnp | grep 18081`

## 节点进程活动

**Windows:**
```powershell
powershell -Command "Get-Process | Sort-Object StartTime -Descending | Select-Object -First 15 Id,ProcessName,StartTime"
```

**Linux:**
```bash
ps aux --sort=-start_time | head -20
```

## Python SSH 函数（ssh_func.py）

```python
import paramiko

def ssh_cmd(host, port, user, password, cmd, timeout=20):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=timeout, banner_timeout=timeout)
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    client.close()
    return out, err

# 使用
out, err = ssh_cmd('192.168.10.203', 22, 'y2k1', 'Qpzm1357', 'free -h')
print(out)
```

## 依赖

```bash
pip install paramiko
```

## 注意事项
- 使用 Python paramiko 库，比 Node.js ssh2 更稳定
- Windows 命令中 `$` 需要转义为 `` `$ ``
- Linux EADDRINUSE / Windows EADDRINUSE = 端口已被占用，服务已在运行
