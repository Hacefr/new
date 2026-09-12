#!/bin/bash
set -e

echo "==> [Gateway Door] Generating EaglercraftXServer configuration for port 10000..."

# Create the correct directory used by EaglercraftXServer
mkdir -p plugins/EaglercraftXServer

# Write the exact listener configuration targeting port 10000 with reverse proxy enabled
cat << 'EOF' > plugins/EaglercraftXServer/listeners.yml
listeners:
  - address: "0.0.0.0:10000"
    behind_reverse_proxy: true
    allow_proxy_protocol: false
    websocket_name: "Shockbyte Gateway"
    rate_limit:
      enable: false
    origin_whitelist: []
    redirect_target: ""
    enable_integrated_auth: false
    enable_integrated_skin: true
    enable_integrated_cape: true
EOF

echo "==> [Gateway Door] Launching Java Waterfall engine on port 10000..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -XX:+UseG1GC -jar Waterfall.jar --noconsole
