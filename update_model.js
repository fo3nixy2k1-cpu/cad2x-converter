const fs = require('fs');
const path = 'C:\\Users\\y2k1\\.openclaw\\openclaw.json';

let content = fs.readFileSync(path, 'utf8');
const cfg = JSON.parse(content);

// 添加 M2.7 模型
cfg.models.providers.minimax.models.push({
  id: 'MiniMax-M2.7-highspeed',
  name: 'MiniMax M2.7 Highspeed',
  input: ['text'],
  cost: { input: 15, output: 60, cacheRead: 2, cacheWrite: 10 },
  contextWindow: 200000,
  maxTokens: 8192,
  reasoning: false
});

// 更新主模型
cfg.agents.defaults.model.primary = 'minimax/MiniMax-M2.7-highspeed';

fs.writeFileSync(path, JSON.stringify(cfg, null, 2), 'utf8');
console.log('done');
