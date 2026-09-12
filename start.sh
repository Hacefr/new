#!/bin/bash
set -e

echo "==> [Gateway Door] Starting port bridge (10000 -> 25577)..."
# Forward external Render port 10000 into Bungee's native channel 25577
socat TCP-LISTEN:10000,fork TCP:127.0.0.1:25577 &

echo "==> [Gateway Door] Launching Java Waterfall proxy engine on 25577..."
exec java -Xms128M -Xmx384M -XX:+UseG1GC -XX:G1HeapRegionSize=4M -XX:+UnlockExperimentalVMOptions -XX:+ParallelRefProcEnabled -XX:+AlwaysPreTouch -jar Waterfall.jar --noconsole
