#!/bin/bash
set -e

# Copy any jar files found in subfolders up into plugins/
find plugins -name "*.jar" -exec cp -n {} plugins/ \; 2>/dev/null || true

echo "==> [Gateway Door] Launching Node.js bridge on port 10000..."
node gateway.js &

# Automated Local Handshake Test
(
    sleep 25
    echo "==> [SELF-TEST] Testing Bungee WebSocket handshake directly on localhost:25577..."
    node -e "
      import('node:net').then(net => {
        const s = net.connect({ port: 25577, host: '127.0.0.1' }, () => {
          console.log('==> [SELF-TEST] Connected to 25577! Sending test handshake...');
          s.write('GET / HTTP/1.1\r\nHost: 127.0.0.1:25577\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\n\r\n');
        });
        s.on('data', d => console.log('==> [SELF-TEST] BUNGEE REPLIED:\n' + d.toString()));
        s.on('error', e => console.log('==> [SELF-TEST] ERROR:', e.message));
        s.on('close', () => console.log('==> [SELF-TEST] CLOSED'));
      });
    " 2>&1 || true
) &

echo "==> [Gateway Door] Launching Waterfall on port 25577..."
exec java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -XX:+UseG1GC -jar Waterfall.jar --noconsole
