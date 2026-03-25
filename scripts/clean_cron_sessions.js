const fs = require('fs');
const path = require('path');

const sessionsDir = 'C:\\Users\\y2k1\\.openclaw\\agents\\main\\sessions';
const sessionsJsonPath = path.join(sessionsDir, 'sessions.json');

let deleted = 0;
let kept = 0;

const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.jsonl') && !f.includes('sessions.json'));

for (const file of files) {
  const filePath = path.join(sessionsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // cron session 特征：第一个用户消息包含 heartbeat/cron 触发词，且没有实际对话
  const isCron = 
    (content.includes('"role":"user"') && 
     content.includes('Read HEARTBEAT.md') &&
     !content.includes('<final>')) ||
    (content.includes('gateway_health_check.js'));
  
  if (isCron) {
    fs.unlinkSync(filePath);
    deleted++;
  } else {
    kept++;
  }
}

console.log(`清理完成: 删除 ${deleted} 个 cron session，保留 ${kept} 个有效 session`);

// 更新 sessions.json
try {
  const sessionsJson = JSON.parse(fs.readFileSync(sessionsJsonPath, 'utf8'));
  const before = Object.keys(sessionsJson).length;
  // 从 sessions.json 中移除已删除的 session
  for (const file of files) {
    const id = file.replace('.jsonl', '').replace('.lock', '');
    delete sessionsJson[id];
  }
  fs.writeFileSync(sessionsJsonPath, JSON.stringify(sessionsJson, null, 2));
  console.log(`sessions.json 更新: ${before} -> ${Object.keys(sessionsJson).length} 条记录`);
} catch (e) {
  console.log('sessions.json 更新失败:', e.message);
}
