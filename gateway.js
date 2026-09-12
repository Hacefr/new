import http from 'node:http';
import net from 'node:net';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!DOCTYPE html><html><body style="background:#121212;color:#eee;text-align:center;padding-top:60px;font-family:sans-serif;"><h1>🚪 Eaglercraft Gateway is Online</h1><p>Connect your Eaglercraft 1.12.2 client to: <code>wss://new-nqpf.onrender.com</code></p></body></html>');
});

server.on('upgrade', (req, clientSocket, head) => {
  console.log('==> [Bridge] Incoming headers:', JSON.stringify(req.headers));

  clientSocket.resume();

  const upstream = net.connect({ port: 25577, host: '127.0.0.1' }, () => {
    // Build standard WebSocket headers
    const headers = [
      `GET ${req.url} HTTP/1.1`,
      `Host: 127.0.0.1:25577`,
      `Upgrade: websocket`,
      `Connection: Upgrade`,
      `Sec-WebSocket-Key: ${req.headers['sec-websocket-key'] || ''}`,
      `Sec-WebSocket-Version: ${req.headers['sec-websocket-version'] || '13'}`,
    ];

    if (req.headers['origin']) {
      headers.push(`Origin: ${req.headers['origin']}`);
    }
    if (req.headers['sec-websocket-protocol']) {
      headers.push(`Sec-WebSocket-Protocol: ${req.headers['sec-websocket-protocol']}`);
    }
    if (req.headers['sec-websocket-extensions']) {
      headers.push(`Sec-WebSocket-Extensions: ${req.headers['sec-websocket-extensions']}`);
    }

    const raw = headers.join('\r\n') + '\r\n\r\n';
    console.log('==> [Bridge] Sending to Bungee:\n' + raw);
    upstream.write(raw);

    if (head && head.length > 0) upstream.write(head);

    clientSocket.pipe(upstream);
    upstream.pipe(clientSocket);
  });

  upstream.on('data', (chunk) => {
    console.log(`==> [Bridge] Bungee response: "${chunk.slice(0, 40).toString()}"`);
  });

  upstream.on('error', (err) => console.error('==> [Bridge] Upstream error:', err.message));
  clientSocket.on('error', (err) => console.error('==> [Bridge] Client error:', err.message));
  upstream.on('close', () => clientSocket.destroy());
  clientSocket.on('close', () => upstream.destroy());
});

server.listen(10000, '0.0.0.0', () => {
  console.log('==> [Gateway Door] Node bridge listening on port 10000');
});
