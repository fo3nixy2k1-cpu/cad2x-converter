const fs = require('fs');
const path = require('path');

function getLargest(dir, depth, maxDepth, exclude, topN) {
  let results = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (exclude && exclude.includes(item)) continue;
      const full = path.join(dir, item);
      try {
        const stat = fs.statSync(full);
        if (stat.isFile()) {
          results.push({ path: full, size: stat.size });
        } else if (stat.isDirectory() && depth < maxDepth) {
          results.push(...getLargest(full, depth+1, maxDepth, exclude, topN));
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

const dirs = [
  { path: 'C:\\Users\\y2k1\\.openclaw\\workspace', maxDepth: 2, exclude: ['node_modules','.git'], topN: 15 },
  { path: 'C:\\Users\\y2k1\\.openclaw\\extensions', maxDepth: 2, exclude: ['node_modules'], topN: 10 },
];

dirs.forEach(({path:dir, maxDepth, exclude, topN}) => {
  console.log('\n=== ' + dir + ' ===');
  const files = getLargest(dir, 0, maxDepth, exclude, topN);
  files.sort((a,b) => b.size - a.size);
  files.slice(0, topN).forEach(f => {
    console.log(fmt(f.size) + '  ' + f.path);
  });
});
