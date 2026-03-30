const fs = require('fs');
const path = require('path');

function getSize(dir) {
  try {
    let total = 0;
    const items = fs.readdirSync(dir);
    for (let i = 0; i < items.length; i++) {
      if (items[i] === 'node_modules' || items[i] === '.git') continue;
      try {
        const stat = fs.statSync(path.join(dir, items[i]));
        if (stat.isFile()) total += stat.size;
      } catch(e) {}
    }
    return total;
  } catch(e) { return 0; }
}

function fmt(n) {
  return n < 1024 ? n + ' B' : n < 1048576 ? Math.round(n/1024) + ' KB' : Math.round(n/1048576) + ' MB';
}

const dirs = [
  'C:\\Users\\y2k1\\.openclaw',
  'C:\\Users\\y2k1\\relay_py'
];

dirs.forEach(base => {
  console.log('\n=== ' + base + ' ===');
  try {
    const items = fs.readdirSync(base);
    items.forEach(item => {
      if (item === 'node_modules') { console.log('  [node_modules 跳过]'); return; }
      const full = path.join(base, item);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          console.log('  ' + item + '/  (' + fmt(getSize(full)) + ')');
        } else {
          console.log('  ' + item + '  (' + fmt(stat.size) + ')');
        }
      } catch(e) { console.log('  ' + item + '  [无法读取]'); }
    });
  } catch(e) { console.log('无法读取: ' + e.message); }
});

// Startup
console.log('\n=== 启动项 ===');
try {
  const items = fs.readdirSync('C:\\Users\\y2k1\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup');
  items.forEach(i => console.log('  ' + i));
} catch(e) { console.log('  无法读取'); }

// 关键配置摘要
console.log('\n=== 关键配置 ===');
try {
  const c = JSON.parse(fs.readFileSync('C:\\Users\\y2k1\\.openclaw\\openclaw.json', 'utf8'));
  if (c.channels && c.channels.feishu) console.log('飞书 appId: ' + c.channels.feishu.appId);
  if (c.auth && c.auth.profiles) console.log('认证 profiles: ' + Object.keys(c.auth.profiles).join(', '));
  if (c.gateway && c.gateway.auth && c.gateway.auth.token) console.log('Gateway token: ' + c.gateway.auth.token.substring(0,10) + '...');
} catch(e) { console.log('配置读取失败: ' + e.message); }
