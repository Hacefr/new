#!/bin/bash
set -e

echo "==> [Gateway Door] Starting Node.js HTTP/WebSocket bridge on port 10000..."
node gateway.js &

echo "==> [Gateway Door] Launching Java Waterfall engine on port 25577..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -Dbungee.native=false -XX:+UseG1GC -jar Waterfall.jar --noconsole
