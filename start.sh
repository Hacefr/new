#!/bin/bash
set -e

PORT="${PORT:-10000}"
echo "==> [Gateway Door] Starting Waterfall with EaglercraftX on port: $PORT"

# Ensure plugin config is present in both folder names used by EaglercraftXServer
mkdir -p plugins/EaglercraftXServer plugins/EaglercraftXBungee
if [ -f "plugins/EaglercraftXBungee/listeners.yml" ]; then
    cp -f plugins/EaglercraftXBungee/listeners.yml plugins/EaglercraftXServer/listeners.yml
fi

# Dynamically bind to Render's internal port
for file in plugins/EaglercraftXServer/listeners.yml plugins/EaglercraftXBungee/listeners.yml; do
    if [ -f "$file" ]; then
        sed -i "s/address: 0.0.0.0:[0-9]*/address: 0.0.0.0:$PORT/g" "$file"
    fi
done

echo "==> [Gateway Door] Launching Java Waterfall proxy engine (headless)..."
exec java -Xms128M -Xmx384M -XX:+UseG1GC -XX:G1HeapRegionSize=4M -XX:+UnlockExperimentalVMOptions -XX:+ParallelRefProcEnabled -XX:+AlwaysPreTouch -jar Waterfall.jar --noconsole
