#!/bin/bash
set -e

echo "==> [Gateway Door] Initializing Waterfall + EaglercraftX..."

# Render dynamically sets $PORT, default to 10000 if unset
PORT="${PORT:-10000}"
echo "==> [Gateway Door] Binding to port: $PORT"

# Ensure plugins directory exists
mkdir -p plugins/EaglercraftXBungee

# Download EaglercraftXBungee if missing
if [ ! -f "plugins/EaglercraftXBungee.jar" ]; then
    echo "==> [Gateway Door] Downloading EaglercraftXBungee with 1.12.2 skin support..."
    curl -fsSL -o plugins/EaglercraftXBungee.jar "https://github.com/lax1dude/eaglercraftx-1.8/releases/download/v1.0.0/EaglercraftXBungee.jar" || \
    curl -fsSL -o plugins/EaglercraftXBungee.jar "https://raw.githubusercontent.com/catfoolyou/EaglercraftX-Bungee/main/EaglercraftXBungee.jar"
fi

# Dynamically patch the port in listeners.yml if the file exists
if [ -f "plugins/EaglercraftXBungee/listeners.yml" ]; then
    sed -i "s/address: 0.0.0.0:[0-9]*/address: 0.0.0.0:$PORT/g" plugins/EaglercraftXBungee/listeners.yml
fi

echo "==> [Gateway Door] Starting Waterfall Proxy Engine..."
exec java -Xms128M -Xmx384M -XX:+UseG1GC -XX:G1HeapRegionSize=4M -XX:+UnlockExperimentalVMOptions -XX:+ParallelRefProcEnabled -XX:+AlwaysPreTouch -jar Waterfall.jar
