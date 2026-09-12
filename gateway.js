import http from 'node:http';
import net from 'node:net';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!DOCTYPE html><html><body style="background:#121212;color:#eee;text-align:center;padding-top:60px;font-family:sans-serif;"><h1>🚪 Eaglercraft Gateway is Online</h1><p>Connect your Eaglercraft 1.12.2 client to: <code>wss://new-nqpf.onrender.com</code></p></body></html>');
});

server.on('upgrade', (req, clientSocket, head) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`==> [Bridge] Incoming connection from ${clientIp}`);

  clientSocket.resume();
  clientSocket.setNoDelay(true);

  const upstream = net.connect({ port: 25577, host: '127.0.0.1' }, () => {
    upstream.setNoDelay(true);

    // Standard client headers without the blocking Origin domain
    const headers = [
      `GET ${req.url} HTTP/1.1`,
      `Host: 127.0.0.1:25577`,
      `Upgrade: websocket`,
      `Connection: Upgrade`,
      `Sec-WebSocket-Key: ${req.headers['sec-websocket-key'] || ''}`,
      `Sec-WebSocket-Version: ${req.headers['sec-websocket-version'] || '13'}`,
      `X-Forwarded-For: ${clientIp}`,
      `X-Forwarded-Proto: https`,
    ];

    const raw = headers.join('\r\n') + '\r\n\r\n';
    upstream.write(raw);

    if (head && head.length > 0) upstream.write(head);

    clientSocket.pipe(upstream);
    upstream.pipe(clientSocket);
  });

  upstream.on('data', (chunk) => {
    const preview = chunk.slice(0, 40).toString().replace(/\r?\n/g, ' ');
    console.log(`==> [Bridge] Bungee response: "${preview}"`);
  });

  upstream.on('error', (err) => console.error('==> [Bridge] Upstream error:', err.message));
  clientSocket.on('error', (err) => console.error('==> [Bridge] Client error:', err.message));
  upstream.on('close', () => clientSocket.destroy());
  clientSocket.on('close', () => upstream.destroy());
});

server.listen(10000, '0.0.0.0', () => {
  console.log('==> [Gateway Door] Node bridge listening on port 10000');
});
