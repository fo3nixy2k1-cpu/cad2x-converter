// Gateway Health Check - 写入健康日志 + 死机诊断
const fs = require('fs');
const http = require('http');
const { execSync } = require('child_process');

function ps(script) {
  return execSync(`powershell -Command "${script}"`, { encoding: 'utf8', timeout: 10000 }).trim();
}

const PORT = 28789;
const logFile = 'C:\\Users\\y2k1\\.openclaw\\workspace\\gateway_health.log';
const diagFile = 'C:\\Users\\y2k1\\.openclaw\\workspace\\gateway_diagnosis.log';
const now = execSync(`powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"`, { encoding: 'utf8', timeout: 3000 }).trim();

// 检测 gateway 是否真正可访问（TCP端口开放即代表存活）
function checkGatewayAlive() {
  return new Promise((resolve) => {
    const client = new (require('net').Socket)();
    client.setTimeout(5000);
    client.connect(PORT, '127.0.0.1', () => {
      client.destroy();
      resolve('OK');
    });
    client.on('timeout', () => { client.destroy(); resolve('DEAD'); });
    client.on('error', () => { resolve('DEAD'); });
  });
}

async function diagnoseGwDead(gwPid) {
  const diag = {};

  if (gwPid) {
    const threads = ps(`(Get-Process -Id ${gwPid} -ErrorAction SilentlyContinue).Threads.Count`);
    const handles = ps(`(Get-Process -Id ${gwPid} -ErrorAction SilentlyContinue).HandleCount`);
    const workingSet = ps(`(Get-Process -Id ${gwPid} -ErrorAction SilentlyContinue).WorkingSet64`);
    const cpu = ps(`(Get-Process -Id ${gwPid} -ErrorAction SilentlyContinue).CPU`);
    diag.gwThreads = parseInt(threads) || 0;
    diag.gwHandles = parseInt(handles) || 0;
    diag.gwMemMB = Math.round(parseInt(workingSet || '0') / 1024 / 1024);
    diag.gwCPU = cpu || 'N/A';
  }

  diag.timeWait = parseInt(ps(`(Get-NetTCPConnection -LocalPort ${PORT} -State TimeWait -ErrorAction SilentlyContinue | Measure-Object).Count`)) || 0;
  diag.finWait2 = parseInt(ps(`(Get-NetTCPConnection -LocalPort ${PORT} -State FinWait2 -ErrorAction SilentlyContinue | Measure-Object).Count`)) || 0;
  diag.closeWait = parseInt(ps(`(Get-NetTCPConnection -LocalPort ${PORT} -State CloseWait -ErrorAction SilentlyContinue | Measure-Object).Count`)) || 0;
  diag.chromeCount = parseInt(ps(`(Get-Process chrome -ErrorAction SilentlyContinue | Measure-Object).Count`)) || 0;
  diag.nodeCount = parseInt(ps(`(Get-Process node -ErrorAction SilentlyContinue | Measure-Object).Count`)) || 0;
  diag.gwChildProcs = gwPid ? (parseInt(ps(`(Get-Process -Id ${gwPid} -ErrorAction SilentlyContinue).ChildCount`)) || 0) : 0;

  // 最近的 gateway 日志错误
  try {
    const today = new Date().toISOString().slice(0, 10);
    const logLines = fs.readFileSync(`C:\\tmp\\openclaw\\openclaw-${today}.log`, 'utf8')
      .split('\n')
      .filter(l => l.includes('ERROR'))
      .slice(-5);
    diag.recentErrors = logLines.map(l => {
      try { return JSON.parse(l).message || l; } catch { return l; }
    }).join(' | ').substring(0, 500);
  } catch { diag.recentErrors = 'N/A'; }

  // 判断原因
  const causes = [];
  if (diag.timeWait > 20) causes.push(`TIME_WAIT过多(${diag.timeWait})→浏览器连接泄漏`);
  if (diag.finWait2 > 5) causes.push(`FIN_WAIT_2(${diag.finWait2})→对方未响应`);
  if (diag.closeWait > 0) causes.push(`CLOSE_WAIT(${diag.closeWait})→连接未正确关闭`);
  if (diag.chromeCount > 10) causes.push(`Chrome进程过多(${diag.chromeCount})→browser tool泄漏`);
  if (diag.gwHandles > 1000) causes.push(`句柄泄漏(${diag.gwHandles})`);
  if (diag.gwThreads > 100) causes.push(`线程过多(${diag.gwThreads})`);
  if (causes.length === 0) causes.push('未知原因(指标正常但HTTP无响应→死循环/死锁)');

  diag.rootCause = causes.join('; ');

  const diagEntry = `${now} | ROOT_CAUSE: ${diag.rootCause} | TIME_WAIT=${diag.timeWait} | FIN_WAIT2=${diag.finWait2} | CLOSE_WAIT=${diag.closeWait} | Chrome=${diag.chromeCount} | Node=${diag.nodeCount} | GwThreads=${diag.gwThreads} | GwHandles=${diag.gwHandles} | GwMem=${diag.gwMemMB}MB | GwCPU=${diag.gwCPU}`;
  fs.appendFileSync(diagFile, diagEntry + '\n');
  console.log('[DIAG]', diagEntry);
  if (diag.recentErrors) console.log('[ERRORS]', diag.recentErrors);

  return diag;
}

async function run() {
  const established = parseInt(ps(`(Get-NetTCPConnection -LocalPort ${PORT} -State Established -ErrorAction SilentlyContinue | Measure-Object).Count`)) || 0;
  const timeWait = parseInt(ps(`(Get-NetTCPConnection -LocalPort ${PORT} -State TimeWait -ErrorAction SilentlyContinue | Measure-Object).Count`)) || 0;
  const closeWait = parseInt(ps(`(Get-NetTCPConnection -LocalPort ${PORT} -State CloseWait -ErrorAction SilentlyContinue | Measure-Object).Count`)) || 0;
  const finWait2 = parseInt(ps(`(Get-NetTCPConnection -LocalPort ${PORT} -State FinWait2 -ErrorAction SilentlyContinue | Measure-Object).Count`)) || 0;

  const gwPid = parseInt(ps(`(Get-NetTCPConnection -LocalPort ${PORT} -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess`)) || 0;
  const gwHandles = gwPid ? (parseInt(ps(`(Get-Process -Id ${gwPid} -ErrorAction SilentlyContinue).HandleCount`)) || 'N/A') : 'N/A';
  const gwMemMB = gwPid ? (parseInt(ps(`[math]::Round((Get-Process -Id ${gwPid}).WorkingSet64/1MB,0)`)) || 'N/A') : 'N/A';
  const chromeCount = parseInt(ps(`(Get-Process chrome -ErrorAction SilentlyContinue | Measure-Object).Count`)) || 0;
  const nodeCount = parseInt(ps(`(Get-Process node -ErrorAction SilentlyContinue | Measure-Object).Count`)) || 0;

  const gwAlive = await checkGatewayAlive();
  const log = `${now} | ESTABLISHED=${established} | TIME_WAIT=${timeWait} | CLOSE_WAIT=${closeWait} | FIN_WAIT2=${finWait2} | Chrome=${chromeCount} | Node=${nodeCount} | GwHandles=${gwHandles} | GwMem=${gwMemMB}MB | GwPID=${gwPid} | GwAlive=${gwAlive}`;

  fs.appendFileSync(logFile, log + '\n');
  console.log(log);

  if (gwAlive === 'DEAD') {
    await diagnoseGwDead(gwPid);
  }
}

run();
