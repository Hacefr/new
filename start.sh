#!/bin/bash
set -e

echo "==> [Gateway Door] Starting Waterfall Eaglercraft Gateway on port 10000..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -XX:+UseG1GC -jar Waterfall.jar --noconsole
