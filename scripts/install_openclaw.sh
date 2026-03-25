#!/bin/bash
set -e
PASS="Qpzm1357"

echo "$PASS" | sudo -S systemctl --user stop openclaw-gateway 2>/dev/null || true
echo "$PASS" | sudo -S npm uninstall -g openclaw-cn 2>/dev/null || true
echo "$PASS" | sudo -S rm -rf /usr/lib/node_modules/openclaw-cn 2>/dev/null || true
echo "$PASS" | sudo -S rm -f /usr/bin/openclaw-cn 2>/dev/null || true
echo "$PASS" | sudo -S npm install -g openclaw@2026.3.13 2>&1
echo "---"
openclaw --version
