#!/bin/bash
set -e

# Copy any jar files found in subfolders up into plugins/
find plugins -name "*.jar" -exec cp -n {} plugins/ \; 2>/dev/null || true

echo "==> [Gateway Door] Launching Node.js bridge on port 10000..."
node gateway.js &

echo "==> [Gateway Door] Launching Waterfall with packet logging..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -Dbungee.packet-decode-logging=true -XX:+UseG1GC -jar Waterfall.jar --noconsole
