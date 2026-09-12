#!/bin/bash
set -e

# Ensure any jar in subfolders is in plugins/
find plugins -name "*.jar" -exec cp -n {} plugins/ \; 2>/dev/null || true

echo "==> [Gateway Door] Launching Node.js HTTP/WebSocket bridge on port 10000..."
node gateway.js &

echo "==> [Gateway Door] Launching Waterfall engine on port 25577..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -XX:+UseG1GC -jar Waterfall.jar --noconsole
