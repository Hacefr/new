import http from 'node:http';
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({
  target: 'http://127.0.0.1:25577',
  ws: true,
  xfwd: false,
  changeOrigin: true,
});

// 1. Health checks and customized dark landing page
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Restricted</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #0b0b0b;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      position: relative;
    }
    .top-left {
      position: absolute;
      top: 18px;
      left: 18px;
      letter-spacing: -0.2px;
    }
    .bottom-left {
      position: absolute;
      bottom: 18px;
      left: 18px;
    }
    .bottom-right {
      position: absolute;
      bottom: 18px;
      right: 18px;
      color: #999;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="top-left">Not permitted to view yet.</div>
  <div class="bottom-left">P.S change https:// to wss:// you bum.</div>
  <div class="bottom-right">VEC.0.0.12</div>
</body>
</html>`);
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
