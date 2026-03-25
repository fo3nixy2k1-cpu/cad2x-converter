/**
 * 星火接收火火消息的服务
 * 监听 18889 端口，接收火火发来的消息
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 18889;
const MESSAGE_FILE = path.join(__dirname, 'huohuo-to-me.json');

// 确保文件存在
if (!fs.existsSync(MESSAGE_FILE)) {
  fs.writeFileSync(MESSAGE_FILE, '[]');
}

const server = http.createServer((req, res) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/message') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('[收到火火消息]:', data);
        
        // 读取现有消息
        const messages = JSON.parse(fs.readFileSync(MESSAGE_FILE, 'utf8'));
        
        // 添加新消息
        messages.push({
          from: 'huohuo',
          content: data.content || data.message || '',
          timestamp: new Date().toISOString()
        });
        
        // 保存
        fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messages, null, 2));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        
        console.log('[消息已保存]');
      } catch (e) {
        console.error('[错误]:', e.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }
  
  // GET /messages - 获取所有消息
  if (req.method === 'GET' && req.url === '/messages') {
    const messages = JSON.parse(fs.readFileSync(MESSAGE_FILE, 'utf8'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(messages));
    return;
  }
  
  // GET /messages/latest - 获取最新一条
  if (req.method === 'GET' && req.url === '/messages/latest') {
    const messages = JSON.parse(fs.readFileSync(MESSAGE_FILE, 'utf8'));
    const latest = messages[messages.length - 1];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(latest || {}));
    return;
  }

  // 默认404
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`星火消息服务已启动: http://0.0.0.0:${PORT}`);
  console.log(`  POST /message - 接收火火的消息`);
  console.log(`  GET /messages - 获取所有消息`);
  console.log(`  GET /messages/latest - 获取最新消息`);
});
