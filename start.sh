#!/bin/bash
set -e

echo "==> [Gateway Door] Launching Waterfall + Eaglercraft directly on port 10000..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -XX:+UseG1GC -jar Waterfall.jar --noconsole
