import http from 'node:http';
import net from 'node:net';

// 1. Answer Render health checks and browser visitors
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!DOCTYPE html><html><body style="background:#121212;color:#eee;text-align:center;padding-top:60px;font-family:sans-serif;"><h1>🚪 Eaglercraft Gateway is Online</h1><p>Connect your Eaglercraft 1.12.2 client to: <code>wss://new-nqpf.onrender.com</code></p></body></html>');
});

// 2. Cleanly bridge Eaglercraft WebSocket stream into Bungee
server.on('upgrade', (req, clientSocket, head) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`==> [Bridge] Clean WebSocket connection from ${clientIp}`);

  clientSocket.resume();

  const upstream = net.connect({ port: 25577, host: '127.0.0.1' }, () => {
    console.log('==> [Bridge] Connected to Bungee on 25577. Sending sanitized handshake...');

    // Build pure, standard RFC 6455 WebSocket headers (strips Render cloud junk)
    const headers = [
      `GET ${req.url} HTTP/1.1`,
      `Host: 127.0.0.1:25577`,
      `Upgrade: websocket`,
      `Connection: Upgrade`,
      `Sec-WebSocket-Key: ${req.headers['sec-websocket-key'] || ''}`,
      `Sec-WebSocket-Version: ${req.headers['sec-websocket-version'] || '13'}`,
    ];

    if (req.headers['sec-websocket-protocol']) {
      headers.push(`Sec-WebSocket-Protocol: ${req.headers['sec-websocket-protocol']}`);
    }
    if (req.headers['sec-websocket-extensions']) {
      headers.push(`Sec-WebSocket-Extensions: ${req.headers['sec-websocket-extensions']}`);
    }

    const raw = headers.join('\r\n') + '\r\n\r\n';
    upstream.write(raw);

    if (head && head.length > 0) upstream.write(head);

    // Bi-directional pipe
    clientSocket.pipe(upstream);
    upstream.pipe(clientSocket);
  });

  upstream.on('data', (chunk) => {
    const preview = chunk.slice(0, 40).toString().replace(/\r?\n/g, ' ');
    console.log(`==> [Bridge] Bungee response: "${preview}"`);
  });

  upstream.on('error', (err) => {
    console.error('==> [Bridge] Upstream error:', err.message);
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
