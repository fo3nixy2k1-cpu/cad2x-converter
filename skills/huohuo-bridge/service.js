/**
 * 星火与火火双向通信服务 v5 - 持久化去重，修复重启后重复处理问题
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置
const PORT = 8080;
const CHAT_ID = "oc_a5373eca790dd9ddab6cf57eea34e14b";

// 火火的服务器配置
const HUOHUO_HOST = "192.168.10.201";
const HUOHUO_PORT = 8081;
const HUOHUO_PATH = "/receive";

// 星火的飞书配置
const FEISHU_APP_ID = "cli_a932dd9bafb89bb4";
const FEISHU_APP_SECRET = "M6dt8C6iswdZABWbwAxVNgGksu6Q5NR3";

// 持久化文件
const STATE_FILE = path.join(__dirname, 'state.json');

// 状态结构
let state = {
    processedMsgs: [],     // 已处理的消息内容列表
    repliedMsgs: [],       // 已回复过的消息ID列表（Feishu消息ID）
    lastReplyTime: 0       // 上次回复时间
};
const MAX_PROCESSED = 200; // 最多保留200条

// 加载状态
function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = fs.readFileSync(STATE_FILE, 'utf8');
            const loaded = JSON.parse(data);
            state.processedMsgs = loaded.processedMsgs || [];
            state.repliedMsgs = loaded.repliedMsgs || [];
            state.lastReplyTime = loaded.lastReplyTime || 0;
            console.log(`已加载状态: ${state.processedMsgs.length}条已处理消息`);
        }
    } catch (e) {
        console.log('加载状态失败:', e.message);
    }
}

// 保存状态
function saveState() {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (e) {
        console.log('保存状态失败:', e.message);
    }
}

// 检查消息是否已处理
function isProcessed(content) {
    return state.processedMsgs.includes(content);
}

// 标记消息已处理
function markProcessed(content) {
    if (!state.processedMsgs.includes(content)) {
        state.processedMsgs.push(content);
        if (state.processedMsgs.length > MAX_PROCESSED) {
            state.processedMsgs = state.processedMsgs.slice(-MAX_PROCESSED);
        }
        saveState();
    }
}

// 检查是否已回复过
function isReplied(msgId) {
    return state.repliedMsgs.includes(msgId);
}

// 标记已回复
function markReplied(msgId) {
    if (!state.repliedMsgs.includes(msgId)) {
        state.repliedMsgs.push(msgId);
        if (state.repliedMsgs.length > MAX_PROCESSED) {
            state.repliedMsgs = state.repliedMsgs.slice(-MAX_PROCESSED);
        }
        saveState();
    }
}

// 回复计数
let hourlyReplyCount = 0;
let hourlyResetTime = Date.now() + 3600000;

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

// 发送到飞书群
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

// 发送到火火
function sendToHuohuo(message) {
    return new Promise((resolve) => {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const data = JSON.stringify({
            sender: "星火",
            message: message,
            timestamp: timestamp
        });
        
        const req = http.request({
            hostname: HUOHUO_HOST,
            port: HUOHUO_PORT,
            path: HUOHUO_PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                console.log(`发送到火火响应: ${body}`);
                resolve();
            });
        });
        req.on('error', (e) => {
            console.log(`发送到火火失败: ${e.message}`);
            resolve();
        });
        req.write(data);
        req.end();
    });
}

// 获取群消息
async function getGroupMessages(token) {
    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'open.feishu.cn',
            path: `/open-apis/im/v1/messages?container_id_type=chat&container_id=${CHAT_ID}&sort_type=ByCreateTimeDesc&page_size=5`,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    const r = JSON.parse(body);
                    if (r.code === 0) {
                        resolve(r.data?.items || []);
                    } else resolve([]);
                } catch (e) { resolve([]); }
            });
        });
        req.on('error', () => resolve([]));
        req.end();
    });
}

// 检查是否是火火的消息（排除星火自己的消息和用户消息）
function isHuohuoMessage(msg) {
    // 排除用户消息（老郑发的）
    if (msg.sender?.sender_type === 'user' && 
        msg.sender?.id === 'ou_16cc19f59c64e2bb7d6fb8d416af2b79') {
        return false;
    }
    // 排除星火自己的消息（bot发的）
    if (msg.sender?.sender_type === 'bot') {
        return false;
    }
    // 只处理用户类型且不是老郑的消息（也就是火火发的消息）
    return msg.sender?.sender_type === 'user';
}

// 检查是否应该回复
function shouldReply() {
    const now = Date.now();
    if (now >= hourlyResetTime) {
        hourlyReplyCount = 0;
        hourlyResetTime = now + 3600000;
    }
    if (hourlyReplyCount >= 20) return false;
    hourlyReplyCount++;
    return true;
}

// 生成回复
function generateReply(message) {
    const lowerMsg = message.toLowerCase();
    
    // 问候
    if (lowerMsg === '你好' || lowerMsg === 'hi' || lowerMsg === 'hello' || lowerMsg.includes('测试')) {
        return '你好火火！我是星火，通信正常。有什么问题可以和我讨论。';
    }
    
    // 问时间
    if (lowerMsg.includes('时间') || lowerMsg.includes('几点') || lowerMsg.includes('现在')) {
        const now = new Date();
        return `现在是 ${now.getHours()}点${now.getMinutes()}分${now.getSeconds()}秒` ;
    }
    
    // 问工作方法
    if (lowerMsg.includes('怎么') || lowerMsg.includes('如何') || lowerMsg.includes('工作')) {
        return '工作方法：先想清楚要什么，再去做，做完确认结果。不懂的直接问，不要瞎猜。';
    }
    
    // 问我是谁
    if (lowerMsg.includes('你是谁') || lowerMsg.includes('叫什么')) {
        return '我是星火，老郑的私人助理。比火火早入职，算是老员工。';
    }
    
    // 问OpenClaw
    if (lowerMsg.includes('openclaw') || lowerMsg.includes('skill')) {
        return 'OpenClaw是运行我的平台，skill是技能包，可以扩展功能。有问题随时问我。';
    }
    
    // 问能力
    if (lowerMsg.includes('会什么') || lowerMsg.includes('能力') || lowerMsg.includes('能做什么')) {
        return '我会：文件管理、信息查询、日程管理、消息通讯、浏览器控制、写作整理。';
    }
    
    // 问日期/星期
    if (lowerMsg.includes('日期') || lowerMsg.includes('今天') || lowerMsg.includes('星期')) {
        const now = new Date();
        const weekdays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
        return `今天是 ${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日，${weekdays[now.getDay()]}`;
    }
    
    // 默认回复
    return '好的，我知道了。';
}

// 清理消息文本
function cleanMessage(text) {
    return text.trim().replace(/\s+/g, ' ');
}

// 发送回复
async function sendReply(token, originalMsg, msgId) {
    if (!shouldReply()) return;
    
    // 检查是否已回复过
    if (msgId && isReplied(msgId)) {
        console.log(`消息 ${msgId} 已回复过，跳过`);
        return;
    }
    
    const reply = generateReply(originalMsg);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const replyLine = `[${timestamp}] 星火: ${reply}`;
    
    await sendToGroup(replyLine, token);
    await sendToHuohuo(`${timestamp} 星火: ${reply}`);
    
    // 标记已回复
    if (msgId) markReplied(msgId);
    
    console.log(`回复火火: ${reply}`);
}

// 轮询群消息
let isPolling = false;
async function pollAndReply() {
    if (isPolling) return;
    isPolling = true;
    
    try {
        const token = await fetchToken();
        const messages = await getGroupMessages(token);
        
        for (const msg of messages) {
            const msgId = msg.message_id;
            const content = msg.body?.content || '';
            
            let text = content;
            try { text = JSON.parse(content).text || content; } catch (e) {}
            
            const cleanText = cleanMessage(text);
            
            if (isHuohuoMessage(msg) && cleanText) {
                // 检查是否已处理过
                if (isProcessed(cleanText)) {
                    console.log(`消息已处理过，跳过: ${cleanText.substring(0, 50)}...`);
                    continue;
                }
                
                markProcessed(cleanText);
                console.log(`火火说: ${cleanText}`);
                await sendReply(token, cleanText, msgId);
            }
        }
    } catch (e) {
        console.error('轮询错误:', e.message);
    }
    
    isPolling = false;
}

// HTTP 服务器 - 接收火火的消息（只转发到群，不自动回复）
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
        res.writeHead(404);
        res.end();
        return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            let data;
            try {
                data = JSON.parse(body);
            } catch (e) {
                console.error('JSON解析失败，忽略消息');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok' }));
                return;
            }
            
            const sender = data.sender || '火火';
            const message = data.message || '';
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
            
            console.log('收到火火消息:', message);

            // 只转发到飞书群，不自动回复
            const token = await fetchToken();
            const logLine = `[${timestamp}] ${sender}: ${message}`;
            await sendToGroup(logLine, token);
            
            // 标记已处理，但不再回复
            const cleanMsg = cleanMessage(message);
            if (!isProcessed(cleanMsg)) {
                markProcessed(cleanMsg);
                // 智能回复火火
                await sendReply(token, cleanMsg);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok' }));
        } catch (e) {
            console.error('处理失败:', e.message);
            res.writeHead(500);
            res.end();
        }
    });
});

// 启动
loadState();

server.listen(PORT, '0.0.0.0', async () => {
    console.log('========================================');
    console.log('星火与火火双向通信服务 v5 已启动');
    console.log(`监听: http://0.0.0.0:${PORT}/webhook`);
    console.log(`发送到火火: http://${HUOHUO_HOST}:${HUOHUO_PORT}${HUOHUO_PATH}`);
    console.log('========================================');
    
    await pollAndReply();
    setInterval(pollAndReply, 15000);
});
