import http from 'node:http';
import { WebSocketServer } from 'ws';
import { config } from './config.js';
import { logger } from './logger.js';
import { handleConnection } from './bridge.js';

// 1. Create HTTP Server for Render health checks and browser visitors
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // Friendly web landing page for anyone opening the Render URL in a browser
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head><title>Eaglercraft Gateway</title></head>
      <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background: #121212; color: #eee;">
        <h1>🚪 Eaglercraft Gateway is Online</h1>
        <p>Connect using your Eaglercraft 1.12.2 client to this URL over <code>wss://</code></p>
        <p style="color: #888;">Target Server: ${config.targetHost}:${config.targetPort}</p>
      </body>
    </html>
  `);
});

// 2. Initialize WebSocket Server attached to the HTTP server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  // Setup heartbeat state
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  handleConnection(ws, req);
});

// 3. Keep-alive heartbeat to prevent Render's proxy from idling out connections
const heartbeatInterval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      logger.debug('Terminating inactive WebSocket client');
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

// 4. Start listening on the designated port
server.listen(config.port, '0.0.0.0', () => {
  logger.info(
    {
      port: config.port,
      target: `${config.targetHost}:${config.targetPort}`,
    },
    '🚪 Eaglercraft WebSocket gateway door is open and listening'
  );
});

// 5. Graceful shutdown handling
const shutdown = (signal) => {
  logger.info({ signal }, 'Received shutdown signal. Closing gateway gracefully...');

  clearInterval(heartbeatInterval);

  wss.close(() => {
    server.close(() => {
      logger.info('Server and all connections closed. Exiting process.');
      process.exit(0);
    });
  });

  // Force close if it takes too long
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
