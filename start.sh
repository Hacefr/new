#!/bin/bash
set -e

echo "==> [Gateway Door] Synchronizing Eaglercraft plugin and configurations..."

# 1. Ensure EaglerXServer.jar is in the root plugins folder
find plugins -name "*.jar" -exec cp -n {} plugins/ \; 2>/dev/null || true

# 2. Ensure plugins/EaglercraftXServer folder exists
mkdir -p plugins/EaglercraftXServer

# 3. Copy listeners.yml from EaglercraftXBungee if present
if [ -f "plugins/EaglercraftXBungee/listeners.yml" ]; then
    cp -f plugins/EaglercraftXBungee/listeners.yml plugins/EaglercraftXServer/listeners.yml
fi

# 4. Patch address to port 10000 and disable rate-limiting in all listeners.yml files
for f in plugins/*/listeners.yml; do
    if [ -f "$f" ]; then
        sed -i "s/address: .*/address: '0.0.0.0:10000'/g" "$f"
        sed -i "s/enable: true/enable: false/g" "$f"
    fi
done

# 5. Ensure Bungee config.yml is listening on 10000
sed -i "s/host: .*/host: 0.0.0.0:10000/g" config.yml
sed -i "s/query_port: .*/query_port: 10000/g" config.yml

echo "==> [Gateway Door] Starting Waterfall directly on port 10000..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -XX:+UseG1GC -jar Waterfall.jar --noconsole
