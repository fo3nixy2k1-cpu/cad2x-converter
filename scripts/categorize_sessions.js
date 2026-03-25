const fs = require('fs');
const path = require('path');

const sessionsDir = 'C:\\Users\\y2k1\\.openclaw\\agents\\main\\sessions';
const exportFile = 'C:\\Users\\y2k1\\.openclaw\\workspace\\memory\\sessions_export.md';

const content = fs.readFileSync(exportFile, 'utf8');
const sessionBlocks = content.split(/^## Session:/m).filter(Boolean);

const categories = {
  '问题解决': [],
  '任务安排': [],
  '系统配置': [],
  '日常闲聊': [],
  '无效/中断': [],
  'cron心跳': []
};

for (const block of sessionBlocks) {
  const lines = block.split('\n');
  const idLine = lines[0].trim();
  const id = idLine.split('\n')[0];
  
  // 获取时间
  const timeMatch = block.match(/\*\*时间\*\*: (.+)/);
  const time = timeMatch ? timeMatch[1] : '未知';
  
  // 获取首条用户消息判断类别
  const userMsgs = [];
  let capture = false;
  let current = '';
  for (const line of lines) {
    if (line.includes('### 👤 用户')) { capture = true; current = ''; continue; }
    if (line.includes('### 🤖 助理')) { capture = false; if (current.trim()) userMsgs.push(current.trim()); current = ''; continue; }
    if (line.startsWith('##')) { capture = false; if (current.trim()) userMsgs.push(current.trim()); break; }
    if (capture) current += line + '\n';
  }
  if (current.trim()) userMsgs.push(current.trim());
  
  const firstMsg = userMsgs[0] || '';
  
  // 分类
  let cat = '日常闲聊';
  if (firstMsg.includes('cron') || firstMsg.includes('heartbeat') || firstMsg.includes('HEARTBEAT_OK')) {
    cat = 'cron心跳';
  } else if (firstMsg.includes('帮我') || firstMsg.includes('你去做') || firstMsg.includes('启动') || firstMsg.includes('部署') || firstMsg.includes('设置') || firstMsg.includes('配置')) {
    cat = '任务安排';
  } else if (firstMsg.includes('为什么') || firstMsg.includes('怎么') || firstMsg.includes('什么问题') || firstMsg.includes('错误') || firstMsg.includes('报错')) {
    cat = '问题解决';
  } else if (firstMsg.includes('看') || firstMsg.includes('检查') || firstMsg.includes('查看') || firstMsg.includes('看看')) {
    cat = '问题解决';
  } else if (firstMsg.includes('系统') || firstMsg.includes('skill') || firstMsg.includes('配置') || firstMsg.includes('安装')) {
    cat = '系统配置';
  } else if (userMsgs.length === 0 || firstMsg.length < 5) {
    cat = '无效/中断';
  }
  
  categories[cat].push({ id, time, firstMsg: firstMsg.substring(0, 80) });
}

console.log('\n# Session 分类统计\n');
console.log('| 类别 | 数量 | 占比 |');
console.log('|------|------|------|');
for (const [cat, items] of Object.entries(categories)) {
  if (items.length > 0) {
    const pct = ((items.length / sessionBlocks.length) * 100).toFixed(1);
    console.log(`| ${cat} | ${items.length} | ${pct}% |`);
  }
}

console.log('\n# 详细列表\n');
for (const [cat, items] of Object.entries(categories)) {
  if (items.length === 0) continue;
  console.log(`\n## ${cat} (${items.length})\n`);
  for (const item of items.slice(0, 20)) {
    console.log(`- **[${item.time}]** ${item.firstMsg}`);
  }
  if (items.length > 20) console.log(`  ... 还有 ${items.length - 20} 条`);
}
