#!/bin/bash
set -e

echo "==> [Gateway Door] Launching Java Waterfall engine in background..."
java -Xms128M -Xmx384M -Djava.net.preferIPv4Stack=true -Dbungee.native=false -XX:+UseG1GC -jar Waterfall.jar --noconsole &
JAVA_PID=$!

echo "==> [Gateway Door] Waiting for BungeeCord to finish booting on port 25577..."
until nc -z 127.0.0.1 25577; do
    sleep 1
done

echo "==> [Gateway Door] BungeeCord is ONLINE! Opening Render port 10000 bridge..."
socat TCP-LISTEN:10000,fork,reuseaddr TCP:127.0.0.1:25577 &

# Keep container alive with Java process
wait $JAVA_PID
