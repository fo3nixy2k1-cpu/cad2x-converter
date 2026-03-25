#!/bin/bash
kill 153296
sleep 3
systemctl --user start openclaw-gateway
echo "ok"
