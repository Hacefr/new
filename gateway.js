const http = require('http');
const net = require('net');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!DOCTYPE html><html><body style="background:#121212;color:#eee;text-align:center;padding-top:60px;font-family:sans-serif;"><h1>🚪 Eaglercraft Gateway is Online</h1><p>Connect your Eaglercraft 1.12.2 client to: <code>wss://new-nqpf.onrender.com</code></p></body></html>');
});

server.on('upgrade', (req, clientSocket, head) => {
  const upstream = net.connect(25577, '127.0.0.1', () => {
    // Replay the exact, original WebSocket request to Bungee
    let raw = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      raw += `${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`;
    }
    raw += '\r\n';

    upstream.write(raw);
    if (head && head.length) upstream.write(head);

    clientSocket.pipe(upstream);
    upstream.pipe(clientSocket);
  });

  upstream.on('error', () => clientSocket.destroy());
  clientSocket.on('error', () => upstream.destroy());
});

server.listen(10000, '0.0.0.0', () => {
  console.log('==> [Gateway Door] Bridge listening on port 10000');
});
