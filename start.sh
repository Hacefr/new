#!/bin/bash
set -e

echo "==> [Gateway Door] Starting Nginx reverse proxy on port 10000..."
nginx -c /app/nginx.conf

echo "==> [Gateway Door] Launching Java Waterfall engine on port 25577..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -XX:+UseG1GC -jar Waterfall.jar --noconsole
