#!/bin/bash
PASS="Qpzm1357"
OPENCLAW_PATH="/home/y2k1/npm-global/bin/openclaw"

# Update systemd service
cat > /home/y2k1/.config/systemd/user/openclaw-gateway.service << 'EOF'
# /home/y2k1/.config/systemd/user/openclaw-gateway.service
[Unit]
Description=OpenClaw Gateway (v2026.3.13)
After=network-online.target
Wants=network-online.target

[Service]
ExecStart="/usr/bin/node" "/home/y2k1/npm-global/lib/node_modules/openclaw/dist/entry.js" gateway --port 18789
Restart=always
RestartSec=5
KillMode=process
Environment=HOME=/home/y2k1
Environment="PATH=/home/y2k1/npm-global/bin:/home/y2k1/.local/bin:/usr/local/bin:/usr/bin:/bin"
Environment=OPENCLAW_GATEWAY_PORT=18789
Environment="OPENCLAW_SYSTEMD_UNIT=openclaw-gateway.service"
Environment="OPENCLAW_SERVICE_MARKER=openclaw"
Environment="OPENCLAW_SERVICE_KIND=gateway"
Environment="OPENCLAW_SERVICE_VERSION=2026.3.13"
EOF

# Reload systemd
echo "$PASS" | sudo -S systemctl --user daemon-reload 2>/dev/null || true
systemctl --user daemon-reload

echo "done"
