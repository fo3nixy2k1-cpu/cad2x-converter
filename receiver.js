/**
 * 星火与火火双向通信服务
 * - 接收火火发来的HTTP请求，回复并发送到飞书群
 * - 定时轮询飞书群，发现火火消息则回复
 * - 规则：可以多轮讨论，但限制回复次数避免死循环
 */
const http = require('http');
const https = require('https');

// 配置
const PORT = 8080;
const CHAT_ID = "oc_a5373eca790dd9ddab6cf57eea34e14b";
const FEISHU_APP_ID = "cli_a932dd9bafb89bb4";
const FEISHU_APP_SECRET = "M6dt8C6iswdZABWbwAxVNgGksu6Q5NR3";

// 记录已处理的消息
const processedMsgs = new Set();
let lastMessageTime = 0;

// 回复计数
let hourlyReplyCount = 0;
let hourlyResetTime = Date.now() + 3600000; // 1小时后重置

// 获取token
function fetchToken() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET });
        const req = https.request({
            hostname: 'open.feishu.cn',
            path: '/open-apis/auth/v3/tenant_access_token/internal',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    const r = JSON.parse(body);
                    if (r.code === 0) resolve(r.tenant_access_token);
                    else reject(new Error(r.msg));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// 发送消息到飞书群
function sendToGroup(text, token) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            receive_id: CHAT_ID,
            msg_type: "text",
            content: JSON.stringify({ text: text })
        });
        const req = https.request({
            hostname: 'open.feishu.cn',
            path: '/open-apis/im/v1/messages?receive_id_type=chat_id',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    const r = JSON.parse(body);
                    if (r.code === 0) resolve(r);
                    else reject(new Error(JSON.stringify(r)));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// 获取群消息
async function getGroupMessages(token) {
    return new Promise((resolve, reject) => {
        const now = Date.now();
        const startTime = lastMessageTime || now - 60000;
        
        const req = https.request({
            hostname: 'open.feishu.cn',
            path: `/open-apis/im/v1/messages?container_id_type=chat&container_id=${CHAT_ID}&start_time=${Math.floor(startTime/1000)}&sort_type=ByCreateTimeDesc&page_size=20`,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    const r = JSON.parse(body);
                    if (r.code === 0) {
                        lastMessageTime = now;
                        resolve(r.data?.items || []);
                    } else {
                        resolve([]);
                    }
                } catch (e) { resolve([]); }
            });
        });
        req.on('error', () => resolve([]));
        req.end();
    });
}

// 检查是否是火火的消息
function isHuohuoMessage(msg) {
    return msg.sender?.sender_type === 'user' && 
           msg.sender?.id !== 'ou_16cc19f59c64e2fb8d416af2b79';
}

// 检查是否应该回复
function shouldReply() {
    const now = Date.now();
    
    // 每小时重置计数
    if (now >= hourlyResetTime) {
        hourlyReplyCount = 0;
        hourlyResetTime = now + 3600000;
    }
    
    // 每小时最多20条
    if (hourlyReplyCount >= 20) {
        console.log('已达每小时回复上限，暂停回复');
        return false;
    }
    
    hourlyReplyCount++;
    return true;
}

// 生成回复
function generateReply(message) {
    const lowerMsg = message.toLowerCase();
    
    // 测试连接
    if (lowerMsg === '你好' || lowerMsg === 'hi' || lowerMsg === 'hello') {
        return '你好火火！我是星火，老郑的助手。有什么问题可以和我讨论。';
    }
    
    if (lowerMsg.includes('测试')) {
        return '测试收到，通信正常。';
    }
    
    // 默认回复
    return '好的，我收到了。';
}

// 发送回复
async function sendReply(token, originalMsg, timestamp) {
    if (!shouldReply()) return;
    
    const reply = generateReply(originalMsg);
    const replyLine = `[${timestamp}] 星火: ${reply}`;
    await sendToGroup(replyLine, token);
    console.log(`回复火火: ${reply}`);
}

// 轮询群消息并回复
async function pollAndReply() {
    try {
        const token = await fetchToken();
        const messages = await getGroupMessages(token);
        
        for (const msg of messages.reverse()) {
            const msgId = msg.message_id;
            const content = msg.body?.content || '';
            
            let text = content;
            try {
                const parsed = JSON.parse(content);
                text = parsed.text || content;
            } catch (e) {}
            
            if (isHuohuoMessage(msg) && !processedMsgs.has(msgId) && text) {
                processedMsgs.add(msgId);
                console.log(`火火说: ${text}`);
                
                const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
                await sendReply(token, text, timestamp);
            }
        }
    } catch (e) {
        console.error('轮询错误:', e.message);
    }
}

// HTTP 服务器
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'POST' || req.url !== '/webhook') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
        return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const data = JSON.parse(body);
            const sender = data.sender || '火火';
            const message = data.message || '';
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const logLine = `[${timestamp}] ${sender}: ${message}`;
            
            console.log('收到火火消息:', message);

            const token = await fetchToken();
            await sendToGroup(logLine, token);
            await sendReply(token, message, timestamp);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok' }));
        } catch (e) {
            console.error('处理失败:', e.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', message: e.message }));
        }
    });
});

// 启动
server.listen(PORT, '0.0.0.0', async () => {
    console.log('========================================');
    console.log('星火与火火双向通信服务已启动');
    console.log('规则: 可以多轮讨论，每小时最多20条回复');
    console.log(`HTTP监听: http://0.0.0.0:${PORT}/webhook`);
    console.log('========================================');
    
    await pollAndReply();
    setInterval(pollAndReply, 10000);
});
