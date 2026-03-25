#!/bin/bash
echo "Qpzm1357" | sudo -S bash -c '
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version
npm --version
'
echo "Node upgrade done at $(date)" >> /tmp/node_upgrade.log
echo "Qpzm1357" | sudo -S npm install -g openclaw@latest >> /tmp/npm_install3.log 2>&1
echo "Exit: $?" >> /tmp/npm_install3.log
echo "Done at $(date)" >> /tmp/npm_install3.log
