const fs = require('fs');
const path = require('path');

function getAll(dir, depth, maxDepth, exclude) {
  let results = [];
  if (depth > maxDepth) return results;
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (exclude && exclude.includes(item)) continue;
      const full = path.join(dir, item);
      try {
        const stat = fs.statSync(full);
        if (stat.isFile()) {
          results.push({ path: full.replace(/\\/g,'/'), size: stat.size });
        } else if (stat.isDirectory()) {
          results.push(...getAll(full, depth+1, maxDepth, exclude));
        }
      } catch(e) {}
    }
  } catch(e) {}
  return results;
}

function fmt(n) {
  if (n < 1048576) return (n/1024).toFixed(1) + ' KB';
  if (n < 1073741824) return (n/1048576).toFixed(1) + ' MB';
  return (n/1073741824).toFixed(2) + ' GB';
}

const files = getAll('C:\\Users\\y2k1\\.openclaw\\workspace', 0, 3, ['node_modules','.git']);
files.sort((a,b) => b.size - a.size);

console.log('文件路径                                          大小       可删');
console.log('─'.repeat(80));
files.slice(0, 50).forEach(f => {
  const rel = f.path.replace('C:/Users/y2k1/.openclaw/workspace/', '');
  const big = f.size > 5*1048576;
  console.log((big ? '✓ ' : '  ') + rel.padEnd(52) + fmt(f.size));
});

let total = files.reduce((s,f) => s+f.size, 0);
let bigTotal = files.filter(f => f.size > 5*1048576).reduce((s,f) => s+f.size, 0);
console.log('\n总文件数: ' + files.length);
console.log('总大小: ' + fmt(total));
console.log('>5MB 文件: ' + fmt(bigTotal));
