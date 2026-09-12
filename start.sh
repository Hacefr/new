#!/bin/bash
set -e

PORT="${PORT:-10000}"
echo "==> [Gateway Door] Starting Waterfall with EaglercraftX on port: $PORT"

# Ensure dynamic port patching in listeners.yml
if [ -f "plugins/EaglercraftXBungee/listeners.yml" ]; then
    sed -i "s/address: 0.0.0.0:[0-9]*/address: 0.0.0.0:$PORT/g" plugins/EaglercraftXBungee/listeners.yml
fi

echo "==> [Gateway Door] Launching Java proxy engine..."
exec java -Xms128M -Xmx384M -XX:+UseG1GC -XX:G1HeapRegionSize=4M -XX:+UnlockExperimentalVMOptions -XX:+ParallelRefProcEnabled -XX:+AlwaysPreTouch -jar Waterfall.jar
