#!/bin/bash
set -e

echo "==> [Gateway Door] Fixing plugin locations..."
# Copy any jar files found in subfolders up into the main plugins/ folder
find plugins -name "*.jar" -exec cp -n {} plugins/ \; 2>/dev/null || true

echo "==> [Gateway Door] Creating EaglercraftXServer configuration for port 10000..."
mkdir -p plugins/EaglercraftXServer

cat << 'EOF' > plugins/EaglercraftXServer/listeners.yml
# EaglercraftXServer listener configuration
listeners:
  - address: "0.0.0.0:10000"
    behind_reverse_proxy: true
    allow_proxy_protocol: false
    websocket_name: "Shockbyte Gateway"
    rate_limit:
      enable: false
    origin_whitelist: []
    redirect_target: "https://eaglercraft.com"
    enable_integrated_auth: false
    enable_integrated_skin: true
    enable_integrated_cape: true
EOF

echo "==> [Gateway Door] Ensuring config.yml is set to port 10000..."
sed -i "s/host: 0.0.0.0:[0-9]*/host: 0.0.0.0:10000/g" config.yml
sed -i "s/query_port: [0-9]*/query_port: 10000/g" config.yml

echo "==> [Gateway Door] Launching Waterfall directly on port 10000..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -XX:+UseG1GC -jar Waterfall.jar --noconsole
