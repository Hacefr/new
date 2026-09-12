#!/bin/bash
set -e

# Copy any jar files found in subfolders up into plugins/
find plugins -name "*.jar" -exec cp -n {} plugins/ \; 2>/dev/null || true

# Diagnostic: waits until the file is created, then prints the exact contents
(
    while [ ! -f "plugins/EaglercraftXServer/listeners.yml" ]; do
        sleep 1
    done
    sleep 2
    echo "================================================"
    echo "==> [DIAGNOSTIC] Generated listeners.yml content:"
    cat plugins/EaglercraftXServer/listeners.yml
    echo "================================================"
) &

echo "==> [Gateway Door] Launching Waterfall directly on port 10000..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -XX:+UseG1GC -jar Waterfall.jar --noconsole
