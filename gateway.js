import http from 'node:http';
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({
  target: 'http://127.0.0.1:25577',
  ws: true,
  xfwd: false,
  changeOrigin: true,
});

// 1. Health checks and browser landing page
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!DOCTYPE html><html><body style="background:#121212;color:#eee;text-align:center;padding-top:60px;font-family:sans-serif;"><h1>🚪 Eaglercraft Gateway is Online</h1><p>Connect your Eaglercraft 1.12.2 client to: <code>wss://new-nqpf.onrender.com</code></p></body></html>');
});

// 2. Proxy WebSockets to Bungee cleanly
server.on('upgrade', (req, socket, head) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`==> [Bridge] Authenticating client ${clientIp} into Bungee...`);

  delete req.headers['x-forwarded-for'];
  delete req.headers['x-forwarded-proto'];
  delete req.headers['x-forwarded-port'];
  delete req.headers['x-forwarded-ssl'];
  delete req.headers['origin'];

  req.headers['host'] = '127.0.0.1:25577';

  proxy.ws(req, socket, head);
});

proxy.on('error', (err) => {
  console.error('==> [Bridge] Proxy error:', err.message);
});

server.listen(10000, '0.0.0.0', () => {
  console.log('==> [Gateway Door] Node http-proxy bridge listening on port 10000');
});
