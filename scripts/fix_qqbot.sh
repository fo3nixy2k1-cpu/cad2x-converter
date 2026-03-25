#!/bin/bash
pkill -9 -f clawdbot 2>/dev/null
sleep 1
rm -rf /usr/lib/node_modules/openclaw-cn/extensions/qqbot
rm -f /home/y2k1/.openclaw/openclaw.json.bak.20260322
sleep 1
systemctl --user start openclaw-gateway
echo "done"
