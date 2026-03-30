const fs = require('fs');
const path = require('path');

function getDirSize(dir, exclude) {
  let total = 0;
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (exclude && exclude.includes(item)) continue;
      const full = path.join(dir, item);
      try {
        const stat = fs.statSync(full);
        if (stat.isFile()) {
          total += stat.size;
        } else if (stat.isDirectory()) {
          total += getDirSize(full, exclude);
        }
      } catch(e) {}
    }
  } catch(e) {}
  return total;
}

function fmt(n) {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n/1024).toFixed(1) + ' KB';
  if (n < 1073741824) return (n/1048576).toFixed(1) + ' MB';
  return (n/1073741824).toFixed(2) + ' GB';
}

const items = [
  { path: 'C:\\Users\\y2k1\\.openclaw\\openclaw.json', label: 'openclaw.json' },
  { path: 'C:\\Users\\y2k1\\.openclaw\\.env', label: '.env' },
  { path: 'C:\\Users\\y2k1\\.openclaw\\credentials', label: 'credentials/' },
  { path: 'C:\\Users\\y2k1\\.openclaw\\workspace', label: 'workspace/' },
  { path: 'C:\\Users\\y2k1\\.openclaw\\memory', label: 'memory/' },
  { path: 'C:\\Users\\y2k1\\.openclaw\\agents', label: 'agents/' },
  { path: 'C:\\Users\\y2k1\\.openclaw\\extensions', label: 'extensions/' },
  { path: 'C:\\Users\\y2k1\\.openclaw\\feishu', label: 'feishu/' },
  { path: 'C:\\Users\\y2k1\\.openclaw\\relay_results', label: 'relay_results/' },
  { path: 'C:\\Users\\y2k1\\relay_py', label: 'relay_py/', exclude: ['__pycache__','7a93951f-ec84-4669-b071-9e5dd41a1a75.jsonl.reset.2026-03-25T19-48-13.md'] },
  { path: 'C:\\Users\\y2k1\\invoices', label: 'invoices/', optional: true },
];

let total = 0;
items.forEach(item => {
  try {
    const stat = fs.statSync(item.path);
    let size = stat.isFile() ? stat.size : getDirSize(item.path, item.exclude || []);
    console.log(item.label + ':  ' + fmt(size));
    total += size;
  } catch(e) {
    if (!item.optional) console.log(item.label + ':  无法读取');
    else console.log(item.label + ':  不存在（跳过）');
  }
});

console.log('\n合计:  ' + fmt(total));
