#!/bin/bash
set -e

# Copy any jar files found in subfolders up into plugins/
find plugins -name "*.jar" -exec cp -n {} plugins/ \; 2>/dev/null || true

# Diagnostic background inspector: prints the generated listeners.yml after boot
(
    sleep 20
    echo "================================================"
    echo "==> [DIAGNOSTIC] Actual generated listeners.yml:"
    cat plugins/EaglercraftXServer/listeners.yml 2>/dev/null || echo "FILE NOT FOUND"
    echo "================================================"
) &

echo "==> [Gateway Door] Launching Waterfall directly on port 10000..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -XX:+UseG1GC -jar Waterfall.jar --noconsole
