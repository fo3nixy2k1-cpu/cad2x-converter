const fs = require('fs');
const path = require('path');

const sessionsDir = 'C:\\Users\\y2k1\\.openclaw\\agents\\main\\sessions';
const outputFile = 'C:\\Users\\y2k1\\.openclaw\\workspace\\memory\\sessions_export.md';

const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.jsonl') && !f.includes('sessions.json'));
files.sort((a, b) => {
  const statA = fs.statSync(path.join(sessionsDir, a));
  const statB = fs.statSync(path.join(sessionsDir, b));
  return statA.mtime - statB.mtime;
});

let output = `# 会话记录导出\n\n共 ${files.length} 个 session 文件\n\n---\n\n`;

for (const file of files) {
  const lines = fs.readFileSync(path.join(sessionsDir, file), 'utf8').split('\n').filter(Boolean);
  const meta = { id: '', timestamp: '', cwd: '' };
  const messages = [];

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'session') {
        meta.id = obj.id;
        meta.timestamp = obj.timestamp;
        meta.cwd = obj.cwd;
      } else if (obj.type === 'message' && obj.message) {
        const role = obj.message.role;
        let content = '';
        if (Array.isArray(obj.message.content)) {
          for (const c of obj.message.content) {
            if (c.type === 'text') content += c.text;
            else if (c.type === 'toolCall') content += `[工具调用: ${c.name}]`;
          }
        }
        if (content) {
          messages.push({ role, content });
        }
      }
    } catch (e) {}
  }

  if (messages.length > 0) {
    const date = new Date(meta.timestamp).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    output += `## Session: ${meta.id}\n\n**时间**: ${date}\n\n`;
    for (const msg of messages) {
      const label = msg.role === 'user' ? '👤 用户' : '🤖 助理';
      output += `### ${label}\n\n${msg.content}\n\n`;
    }
    output += `---\n\n`;
  }
}

fs.writeFileSync(outputFile, output);
console.log(`导出完成: ${outputFile}`);
console.log(`文件大小: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(1)} MB`);
console.log(`共处理 ${files.length} 个 session，提取消息的: ${messages.length}`);
