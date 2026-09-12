#!/bin/bash
set -e

echo "==> [Gateway Door] Starting Nginx reverse proxy on port 10000..."
nginx -c /app/nginx.conf

echo "==> [Gateway Door] Generating locked EaglercraftXServer configuration..."
mkdir -p plugins/EaglercraftXServer
chmod 777 plugins/EaglercraftXServer 2>/dev/null || true

cat << 'EOF' > plugins/EaglercraftXServer/listeners.yml
# EaglercraftXServer listener configuration
listeners:
  - address: "0.0.0.0:25577"
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

# Lock the configuration file so the plugin cannot overwrite it with defaults
chmod 444 plugins/EaglercraftXServer/listeners.yml

echo "==> [Gateway Door] Launching Java Waterfall engine on port 25577..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -XX:+UseG1GC -jar Waterfall.jar --noconsole
