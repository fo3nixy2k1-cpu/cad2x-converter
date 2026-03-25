#!/usr/bin/env python3
"""
Weekly memory consolidation: read recent daily logs, extract insights, update MEMORY.md
"""
import os, glob, re
from datetime import datetime, timedelta

MEMORY_DIR = os.path.expanduser('~/.openclaw/workspace/memory')
MEMORY_FILE = os.path.expanduser('~/.openclaw/workspace/MEMORY.md')

def load_recent_logs():
    """Read .md files from last 7 days in memory/ directory"""
    today = datetime.now()
    files = []
    for i in range(7):
        day = today - timedelta(days=i)
        path = os.path.join(MEMORY_DIR, day.strftime('%Y-%m-%d') + '.md')
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                files.append((day.strftime('%Y-%m-%d'), f.read()))
    return files

def load_current_memory():
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, 'r', encoding='utf-8') as f:
            return f.read()
    return ""

def extract_insights(logs):
    """Extract up to 5 key insights from log entries"""
    insights = []
    seen = set()
    
    for date, content in logs:
        lines = content.split('\n')
        for line in lines:
            # Skip short or noisy lines
            line = line.strip()
            if len(line) < 30:
                continue
            if any(kw in line.lower() for kw in ['heartbeat_ok', 'cron', 'heartbeat', 'session', 'subagent', 'spawn']):
                continue
            # Skip headers and very generic lines
            if line.startswith('#') or line.startswith('*') or line.startswith('- '):
                continue
            
            fingerprint = line[5:40].lower()
            if fingerprint in seen:
                continue
            seen.add(fingerprint)
            
            # Clean line
            clean = re.sub(r'^[\d\-\s\*\#]+', '', line).strip()
            if len(clean) > 15:
                insights.append(f"[{date}] {clean}")
            
            if len(insights) >= 5:
                break
        if len(insights) >= 5:
            break
    
    return insights

def update_memory(insights):
    timestamp = datetime.now().strftime('%Y-%m-%d')
    section = f"\n## 📝 周总结 {timestamp}\n\n"
    if insights:
        section += "**近7天重要认知：**\n"
        for i, insight in enumerate(insights, 1):
            section += f"{i}. {insight}\n"
    else:
        section += "_本周无显著认知_\n"
    
    current = load_current_memory()
    lines = current.split('\n')
    
    # Insert after the first ## heading found (after title)
    insert_idx = 0
    found_first = False
    for i, line in enumerate(lines):
        if line.startswith('## '):
            if found_first:
                insert_idx = i
                break
            found_first = True
    
    lines.insert(insert_idx + 1, section)
    new_content = '\n'.join(lines)
    
    with open(MEMORY_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated MEMORY.md with {len(insights)} insights at {timestamp}")

if __name__ == '__main__':
    logs = load_recent_logs()
    print(f"Found {len(logs)} log files in last 7 days")
    for date, content in logs:
        print(f"  {date}: {len(content)} chars")
    
    insights = extract_insights(logs)
    print(f"Extracted {len(insights)} insights")
    for i, ins in enumerate(insights, 1):
        print(f"  {i}. {ins[:80]}")
    
    update_memory(insights)
