$content = @'
import os
import glob
from datetime import datetime, timedelta

MEMORY_DIR = r'C:\Users\fo3nix\.openclaw\memory'
MEMORY_FILE = r'C:\Users\fo3nix\.openclaw\MEMORY.md'
LOG_DIR = r'C:\Users\fo3nix\.openclaw\logs'

def get_recent_logs():
    logs = []
    cutoff = datetime.now() - timedelta(days=7)
    log_files = glob.glob(os.path.join(LOG_DIR, '*.log'))
    for f in log_files:
        try:
            mtime = datetime.fromtimestamp(os.path.getmtime(f))
            if mtime >= cutoff:
                with open(f, encoding='utf-8', errors='ignore') as fp:
                    logs.append(fp.read())
        except:
            pass
    return '\n'.join(logs)

def get_recent_memory_notes():
    notes = []
    cutoff = datetime.now() - timedelta(days=7)
    md_files = glob.glob(os.path.join(MEMORY_DIR, '*.md'))
    for f in md_files:
        try:
            mtime = datetime.fromtimestamp(os.path.getmtime(f))
            if mtime >= cutoff:
                with open(f, encoding='utf-8', errors='ignore') as fp:
                    notes.append(fp.read())
        except:
            pass
    return '\n'.join(notes)

def extract_insights(content):
    lines = [l.strip() for l in content.split('\n') if l.strip() and len(l.strip()) > 20]
    insights = []
    keywords = ['learned', 'remember', 'important', 'note', 'lesson', 'decision', 'fixed', 'updated', 'configured', 'deployed', '发现', '记住', '重要', '教训', '决策', '配置', '部署']
    for line in lines:
        lower = line.lower()
        if any(k in lower for k in keywords):
            insights.append(line)
    if not insights and lines:
        insights = lines[:5]
    return insights[:5]

def update_memory():
    content = get_recent_logs() + '\n' + get_recent_memory_notes()
    insights = extract_insights(content)
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')
    section = '\n## Weekly Insights (' + timestamp + ')\n'
    if insights:
        for i, ins in enumerate(insights, 1):
            section += str(i) + '. ' + ins + '\n'
    else:
        section += 'No significant insights this week.\n'
    
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, encoding='utf-8') as f:
            existing = f.read()
        marker = '## Weekly Insights'
        if marker in existing:
            existing = existing.split(marker)[0].rstrip()
        section = existing + section
        with open(MEMORY_FILE, 'w', encoding='utf-8') as f:
            f.write(section)
    else:
        with open(MEMORY_FILE, 'w', encoding='utf-8') as f:
            f.write('# MEMORY.md\n' + section)
    
    print('Updated MEMORY.md with ' + str(len(insights)) + ' insights at ' + timestamp)

if __name__ == '__main__':
    update_memory()
'@

$bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
$base64 = [Convert]::ToBase64String($bytes)
$remoteCmd = "powershell -Command ""`$b = [Convert]::FromBase64String('$base64'); [IO.File]::WriteAllBytes('C:\Users\fo3nix\.openclaw\weekly_memory.py', `$b)"
plink -ssh -hostkey SHA256:ZIixNV96vgob0IsfM3k8ZXMSFji2ljXvXDydXp52m2g -pw Testonly.3a fo3nix@192.168.10.201 $remoteCmd
