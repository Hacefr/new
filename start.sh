#!/bin/bash
set -e

# Copy any jar files found in subfolders up into plugins/
find plugins -name "*.jar" -exec cp -n {} plugins/ \; 2>/dev/null || true

echo "==> [Gateway Door] Launching Node.js http-proxy bridge on port 10000..."
node gateway.js &

echo "==> [Gateway Door] Launching Waterfall proxy engine..."
exec java -Xms128M -Xmx384M \
  --add-opens java.base/java.lang=ALL-UNNAMED \
  --add-opens java.base/java.lang.reflect=ALL-UNNAMED \
  --add-opens java.base/java.net=ALL-UNNAMED \
  --add-opens java.base/java.util=ALL-UNNAMED \
  -Djava.net.preferIPv4Stack=true \
  -XX:+UseG1GC \
  -jar Waterfall.jar --noconsole --verbose
