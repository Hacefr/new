import http from 'node:http';
import net from 'node:net';

// 1. Answer Render health checks and browser visitors
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!DOCTYPE html><html><body style="background:#121212;color:#eee;text-align:center;padding-top:60px;font-family:sans-serif;"><h1>🚪 Eaglercraft Gateway is Online</h1><p>Connect your Eaglercraft 1.12.2 client to: <code>wss://new-nqpf.onrender.com</code></p></body></html>');
});

// 2. Bridge Eaglercraft WebSocket connections into Bungee on 25577
server.on('upgrade', (req, clientSocket, head) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`==> [Bridge] Incoming Eaglercraft WebSocket connection from ${clientIp}`);

  clientSocket.resume();

  const upstream = net.connect({ port: 25577, host: '127.0.0.1' }, () => {
    console.log('==> [Bridge] Linked to BungeeCord on 25577! Passing handshake...');

    // Replay original WebSocket headers to Bungee
    let raw = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      raw += `${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`;
    }
    raw += '\r\n';

    upstream.write(raw);
    if (head && head.length > 0) upstream.write(head);

    // Bi-directional pipe
    clientSocket.pipe(upstream);
    upstream.pipe(clientSocket);
  });

  upstream.on('data', (chunk) => {
    // Log initial response from Bungee
    const preview = chunk.slice(0, 30).toString().replace(/\r?\n/g, ' ');
    console.log(`==> [Bridge] Bungee replied: "${preview}"`);
  });

  upstream.on('error', (err) => {
    console.error('==> [Bridge] Upstream error connecting to Bungee:', err.message);
    clientSocket.destroy();
  });

  clientSocket.on('error', (err) => {
    console.error('==> [Bridge] Client socket error:', err.message);
    upstream.destroy();
  });

  upstream.on('close', () => clientSocket.destroy());
  clientSocket.on('close', () => upstream.destroy());
});

server.listen(10000, '0.0.0.0', () => {
  console.log('==> [Gateway Door] Node bridge listening on port 10000');
});
