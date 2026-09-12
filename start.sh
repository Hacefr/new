#!/bin/bash
set -e

echo "==> [Gateway Door] Starting Nginx reverse proxy on port 10000..."
nginx -c /app/nginx.conf

echo "==> [Gateway Door] Enabling Eaglercraft debug mode..."
mkdir -p plugins/EaglercraftXServer

# Enable verbose debugging in settings.yml so Eaglercraft logs why it drops connections
cat << 'EOF' > plugins/EaglercraftXServer/settings.yml
# EaglercraftXServer settings
debug: true
EOF

echo "==> [Gateway Door] Launching Java Waterfall engine on port 25577 (Standard Java NIO)..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -Dbungee.native=false -XX:+UseG1GC -jar Waterfall.jar --noconsole
