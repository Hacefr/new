import net from 'node:net';
import crypto from 'node:crypto';
import { config } from './config.js';
import { logger } from './logger.js';

export function handleConnection(ws, req) {
  const sessionId = crypto.randomUUID().slice(0, 8);
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

  logger.info({ sessionId, clientIp }, 'New Eaglercraft WebSocket connection initiated');

  // Open raw TCP socket to the Shockbyte Minecraft server
  const tcpSocket = net.connect({
    host: config.targetHost,
    port: config.targetPort,
  });

  // Disable Nagle's algorithm for minimal packet latency
  tcpSocket.setNoDelay(true);

  let isCleanedUp = false;

  const cleanup = (reason) => {
    if (isCleanedUp) return;
    isCleanedUp = true;

    logger.info({ sessionId, reason }, 'Closing bridge connection session');

    try {
      tcpSocket.destroy();
    } catch (_) {}

    try {
      if (ws.readyState === ws.OPEN || ws.readyState === ws.CONNECTING) {
        ws.close(1000, reason);
      }
    } catch (_) {}
  };

  // TCP Socket (Shockbyte) Handlers
  tcpSocket.on('connect', () => {
    logger.info({ sessionId, target: `${config.targetHost}:${config.targetPort}` }, 'Connected to Shockbyte server');
  });

  tcpSocket.on('data', (data) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(data, { binary: true }, (err) => {
        if (err) {
          logger.error({ sessionId, err: err.message }, 'Failed to deliver packet to WebSocket client');
          cleanup('ws_send_error');
        }
      });
    }
  });

  tcpSocket.on('error', (err) => {
    logger.error({ sessionId, err: err.message }, 'TCP socket error with Shockbyte server');
    cleanup('tcp_error');
  });

  tcpSocket.on('close', () => {
    cleanup('tcp_closed');
  });

  // WebSocket (Eaglercraft) Handlers
  ws.on('message', (message) => {
    if (tcpSocket.writable) {
      tcpSocket.write(message, (err) => {
        if (err) {
          logger.error({ sessionId, err: err.message }, 'Failed to write packet to Shockbyte server');
          cleanup('tcp_write_error');
        }
      });
    }
  });

  ws.on('error', (err) => {
    logger.error({ sessionId, err: err.message }, 'WebSocket client error');
    cleanup('ws_error');
  });

  ws.on('close', (code, reason) => {
    cleanup(`ws_closed_${code}`);
  });
}
