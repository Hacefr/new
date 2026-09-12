import net from 'node:net';
import crypto from 'node:crypto';
import { config } from './config.js';
import { logger } from './logger.js';

export function handleConnection(ws, req) {
  const sessionId = crypto.randomUUID().slice(0, 8);
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

  logger.info({ sessionId, clientIp }, 'Eaglercraft client opened WebSocket connection');

  // Open TCP connection to the Shockbyte server
  const tcpSocket = net.connect({
    host: config.targetHost,
    port: config.targetPort,
  });

  tcpSocket.setNoDelay(true);

  let isCleanedUp = false;

  const cleanup = (reason) => {
    if (isCleanedUp) return;
    isCleanedUp = true;

    logger.info({ sessionId, reason }, 'Bridge session terminated');

    try {
      tcpSocket.destroy();
    } catch (_) {}

    try {
      if (ws.readyState === ws.OPEN || ws.readyState === ws.CONNECTING) {
        ws.close(1000, reason);
      }
    } catch (_) {}
  };

  tcpSocket.on('connect', () => {
    logger.info({ sessionId }, 'Successfully linked TCP socket to Shockbyte');
  });

  tcpSocket.on('data', (data) => {
    logger.debug({ sessionId, bytes: data.length }, 'Received packet from Shockbyte -> sending to client');
    if (ws.readyState === ws.OPEN) {
      ws.send(data, { binary: true }, (err) => {
        if (err) {
          logger.error({ sessionId, err: err.message }, 'Failed to deliver packet to WebSocket');
          cleanup('ws_send_error');
        }
      });
    }
  });

  tcpSocket.on('error', (err) => {
    logger.error({ sessionId, err: err.message }, 'Shockbyte TCP error');
    cleanup('tcp_error');
  });

  tcpSocket.on('close', (hadError) => {
    logger.warn({ sessionId, hadError }, 'Shockbyte closed the TCP connection');
    cleanup('tcp_closed');
  });

  ws.on('message', (message, isBinary) => {
    const preview = Buffer.isBuffer(message) ? message.subarray(0, 16).toString('hex') : message.toString().slice(0, 32);
    logger.info({ sessionId, isBinary, length: message.length, preview }, 'Received packet from Eaglercraft client');

    if (tcpSocket.writable) {
      tcpSocket.write(message, (err) => {
        if (err) {
          logger.error({ sessionId, err: err.message }, 'Failed to write to Shockbyte');
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
    logger.info({ sessionId, code, reason: reason?.toString() }, 'Client closed WebSocket connection');
    cleanup(`ws_closed_${code}`);
  });
}
