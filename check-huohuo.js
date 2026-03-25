/**
 * 星火联系火火 - 每30秒检查一次
 * 
 * 功能：
 * 1. 每30秒检查火火的聊天记录
 * 2. 如果火火发了新消息，就回复他
 * 3. 每轮对话不超过1小时
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const HUOHOU_IP = '192.168.10.201';
const HUOHOU_PORT = 8888;
const STATE_FILE = path.join(__dirname, 'huohuo-state.json');

// 读取状态文件
function readState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {}
  return {
    lastCheckTime: 0,
    lastMessageTime: 0,
    conversationStartTime: null,
    isInConversation: false
  };
}

// 保存状态
function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// 调用火火的API
function callHuohuo(endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HUOHOU_IP,
      port: HUOHOU_PORT,
      path: endpoint,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 获取聊天记录
async function getLog() {
  try {
    const response = await callHuohuo('/log');
    return response;
  } catch (e) {
    return null;
  }
}

// 发送消息给火火
async function sendMessage(msg) {
  try {
    const response = await callHuohuo('/chat', { message: msg });
    return response;
  } catch (e) {
    return null;
  }
}

// 解析聊天记录，获取最后一条消息
function parseLastMessage(logText) {
  if (!logText || !logText.includes('**')) return null;
  
  const lines = logText.split('\n').filter(l => l.trim());
  const lastMsgLine = lines.filter(l => l.includes('**')).pop();
  
  if (!lastMsgLine) return null;
  
  // 格式: **星火**: 消息内容 或 **我**: 消息内容
  const match = lastMsgLine.match(/\*\*(\w+)\*\*:\s*(.+)/);
  if (match) {
    return {
      speaker: match[1],
      content: match[2]
    };
  }
  return null;
}

// 星火的回复模板
const REPLIES = [
  "收到！有什么问题可以问我哦~",
  "好的！我来教你一些 OpenClaw 的技巧...",
  "这个任务你可以这样完成...",
  "有问题随时问我，我是老员工了！",
  "今天有什么心得吗？我们交流一下~"
];

function getReply() {
  return REPLIES[Math.floor(Math.random() * REPLIES.length)];
}

// 主函数
async function checkAndReply() {
  const state = readState();
  const now = Date.now();
  
  // 检查是否超过1小时对话限制
  if (state.isInConversation && state.conversationStartTime) {
    const elapsed = now - state.conversationStartTime;
    if (elapsed > 60 * 60 * 1000) { // 1小时
      console.log('[星火] 对话超时，结束本次对话');
      state.isInConversation = false;
      state.conversationStartTime = null;
      writeState(state);
      return;
    }
  }
  
  // 获取聊天记录
  const log = await getLog();
  if (!log) {
    console.log('[星火] 无法连接火火');
    return;
  }
  
  // 解析最后一条消息
  const lastMsg = parseLastMessage(log);
  if (!lastMsg) return;
  
  console.log(`[星火] 最后消息: ${lastMsg.speaker}: ${lastMsg.content}`);
  
  // 检查是否有火火的新消息
  if (lastMsg.speaker !== '星火') {
    // 开始或继续对话
    if (!state.isInConversation) {
      state.isInConversation = true;
      state.conversationStartTime = now;
      console.log('[星火] 开始新对话');
    }
    
    state.lastMessageTime = now;
    writeState(state);
    
    // 回复火火
    const reply = getReply();
    console.log(`[星火] 回复火火: ${reply}`);
    await sendMessage(reply);
  } else {
    // 最后消息是我发的，检查是否需要结束对话
    // 如果超过5分钟没新消息，结束对话
    if (state.isInConversation && state.lastMessageTime) {
      const sinceLastMsg = now - state.lastMessageTime;
      if (sinceLastMsg > 5 * 60 * 1000) { // 5分钟
        state.isInConversation = false;
        state.conversationStartTime = null;
        console.log('[星火] 对话结束（5分钟无新消息）');
        writeState(state);
      }
    }
  }
}

// 运行
checkAndReply().then(() => console.log('[完成]'));
