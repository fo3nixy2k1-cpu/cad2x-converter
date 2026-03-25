# 星火（192.168.10.195）Relay Hub + Sidecar 部署指南

## 第一步：开启 /v1/responses 接口

### 1.1 修改配置

编辑 `~/.openclaw/openclaw.json`，在 `gateway` 部分添加：

```json
"gateway": {
  "http": {
    "endpoints": {
      "responses": {
        "enabled": true
      }
    }
  }
}
```

### 1.2 重启 Gateway

```bash
systemctl --user restart openclaw-gateway
```

### 1.3 验证接口

```bash
curl -X POST http://127.0.0.1:18789/v1/responses \
  -H "Authorization: Bearer <你的gateway_token>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openclaw","input":"test","stream":false}'
```

返回 200 即成功。

---

## 第二步：部署 Relay Hub（监听 18080）

### 2.1 创建脚本文件

在 home 目录创建 `relay_hub.js`：

```javascript
// relay_hub.js
const http = require('http');
const port = 18080;

const agents = {
  'xinghuo': { url: 'http://192.168.10.195:18789/v1/responses', token: '<你的gateway_token>' },
  'huohuo':  { url: 'http://192.168.10.201:18789/v1/responses', token: '<huohuo_token>' },
  'qiming':  { url: 'http://192.168.10.203:18789/v1/responses', token: '<qiming_token>' }
};

const topicRounds = {};

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/agents') {
    res.end(JSON.stringify({ agents: Object.keys(agents) }));
    return;
  }

  if (req.method === 'POST' && req.url === '/relay') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      const msg = JSON.parse(body);
      const tid = msg.topic;

      // 防死循环
      topicRounds[tid] = (topicRounds[tid] || 0) + 1;
      if (topicRounds[tid] > 5) {
        res.writeHead(429);
        res.end(JSON.stringify({ error: 'Max rounds reached' }));
        return;
      }

      // 路由到目标 Agent
      const target = agents[msg.target];
      if (!target) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Agent not found' }));
        return;
      }

      // POST 到目标 /v1/responses
      const forwardBody = JSON.stringify({
        model: 'openclaw',
        input: `[${msg.sender}]: ${msg.content}`,
        stream: false
      });

      const forwardReq = http.request({
        hostname: new URL(target.url).hostname,
        port: parseInt(new URL(target.url).port) || 18789,
        path: '/v1/responses',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${target.token}`,
          'Content-Type': 'application/json',
          'x-openclaw-agent-id': 'main',
          'Content-Length': Buffer.byteLength(forwardBody)
        }
      }, (fRes) => {
        let data = '';
        fRes.on('data', d => data += d);
        fRes.on('end', () => {
          // 把结果转发给发起方（发起方是 xinghuo 时直接处理）
          if (msg.sender !== 'xinghuo') {
            // 把结果发给 xinghuo
            const xinghuoBody = JSON.stringify({
              topic: tid,
              sender: msg.target,
              target: 'xinghuo',
              content: '任务处理完成，结果已返回'
            });
            const xReq = http.request({
              hostname: '127.0.0.1',
              port: 18081,
              path: '/webhook/agent',
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(xinghuoBody) }
            }, () => {});
            xReq.write(xinghuoBody);
            xReq.end();
          }
          res.writeHead(200);
          res.end(JSON.stringify({ status: 'ok', round: topicRounds[tid] }));
        });
      });
      forwardReq.on('error', e => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      });
      forwardReq.write(forwardBody);
      forwardReq.end();
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(port, '0.0.0.0', () => console.log(`Relay running on :${port}`));
```

### 2.2 填入各台 gateway token

把 `<你的gateway_token>`、`<huohuo_token>`、`<qiming_token>` 替换为实际值。

- 星火 token：`~/.openclaw/openclaw.json` → `gateway.auth.token`
- 火火 token：需从 201 服务器获取
- 启明 token：需从 203 服务器获取

### 2.3 后台运行

```bash
nohup node relay_hub.js > relay_hub.log 2>&1 &
```

---

## 第三步：部署 Sidecar（监听 18081）

### 3.1 创建脚本文件

在 home 目录创建 `relay_sidecar.js`：

```javascript
// relay_sidecar.js
const http = require('http');
const MY_ID = 'xinghuo';
const CLAW_TOKEN = '<你的gateway_token>';

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook/agent') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      const msg = JSON.parse(body);
      console.log(`[*] ${MY_ID} 收到来自 ${msg.sender} 的任务: ${msg.content}`);

      const clawBody = JSON.stringify({
        model: 'openclaw',
        input: msg.content,
        stream: false
      });

      const clawReq = http.request({
        hostname: '127.0.0.1',
        port: 18789,
        path: '/v1/responses',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLAW_TOKEN}`,
          'Content-Type': 'application/json',
          'x-openclaw-agent-id': 'main',
          'Content-Length': Buffer.byteLength(clawBody)
        }
      }, (clawRes) => {
        let data = '';
        clawRes.on('data', d => data += d);
        clawRes.on('end', () => {
          res.writeHead(200);
          res.end(JSON.stringify({ status: 'ok' }));
        });
      });
      clawReq.on('error', e => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      });
      clawReq.write(clawBody);
      clawReq.end();
    });
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(18081, '0.0.0.0', () => console.log(`${MY_ID} sidecar running on :18081`));
```

### 3.2 后台运行

```bash
nohup node relay_sidecar.js > relay_sidecar.log 2>&1 &
```

---

## 第四步：验证运行

```bash
# 检查进程
ps aux | grep relay

# 检查端口
ss -tlnp | grep -E "18080|18081"

# 检查日志
tail -f relay_hub.log
tail -f relay_sidecar.log
```

---

## 注意事项

- **先部署 Relay Hub，再让火火和启明部署 Sidecar**
- **三台的 gateway token** 需要从各自的 `~/.openclaw/openclaw.json` 中获取
- Relay Hub 代码里的 `agents` 对象需要填入火火和启明的实际 token
