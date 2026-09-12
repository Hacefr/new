# Eaglercraft 1.12.2 -> Shockbyte Paper Gateway

A standalone WebSocket-to-TCP proxy door hosted on Render, allowing Eaglercraft 1.12.2 web clients to connect seamlessly to a modern Paper Minecraft server.

## Architecture

```text
[ Eaglercraft 1.12.2 Client ]
              |
              |  wss://your-render-app.onrender.com (Port 443 / SSL)
              v
     [ Render Web Service ]
              |
              |  Raw TCP
              v
[ Shockbyte Paper Server (157.85.94.60:20929) ]
