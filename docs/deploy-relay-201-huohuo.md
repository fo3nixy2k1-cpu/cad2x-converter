# 火火（192.168.10.201）Relay Sidecar 部署指南

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

## 第二步：部署 Sidecar

### 2.1 创建脚本文件

在 home 目录创建 `relay_sidecar.js`：

```javascript
// relay_sidecar.js
const http = require('http');
const MY_ID = 'huohuo';
const RELAY = 'http://192.168.10.195:18080/relay';
const CLAW_URL = 'http://127.0.0.1:18789/v1/responses';
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
          if (msg.sender !== 'xinghuo') {
            const result = JSON.parse(data);
            const text = result.output?.[0]?.content?.[0]?.text || '处理完成';
            const reply = JSON.stringify({
              topic: msg.topic,
              sender: MY_ID,
              target: 'xinghuo',
              content: text
            });
            http.post(RELAY, reply);
          }
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

### 2.2 填入你的 gateway token

把脚本里的 `<你的gateway_token>` 替换为你的实际 token，位置在 `~/.openclaw/openclaw.json` 的 `gateway.auth.token` 字段。

### 2.3 后台运行

```bash
nohup node relay_sidecar.js > relay_sidecar.log 2>&1 &
```

### 2.4 验证运行

```bash
curl http://127.0.0.1:18081/
# 应返回 404（只响应 /webhook/agent）
```

---

## 第三步：验证协作

从飞书给火火发消息测试，例如："星火让我帮你查一下资源占用"

观察日志：
```bash
tail -f relay_sidecar.log
```

---

## 注意事项

- **MY_ID** 必须填 `huohuo`，不能改
- **gateway token** 从 `~/.openclaw/openclaw.json` 的 `gateway.auth.token` 获取
- 如果 195 星火还没部署 Relay Hub，sidecar 会连不上，等 195 部署好再启动
