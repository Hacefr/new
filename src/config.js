import 'dotenv/config';

export const config = {
  // Port to listen on (Render automatically provides process.env.PORT)
  port: parseInt(process.env.PORT, 10) || 8080,

  // Shockbyte Minecraft Server Destination
  targetHost: process.env.TARGET_HOST || '157.85.94.60',
  targetPort: parseInt(process.env.TARGET_PORT, 10) || 20929,

  // Logging level (fatal, error, warn, info, debug, trace)
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Basic startup sanity checks
if (isNaN(config.port) || config.port <= 0 || config.port > 65535) {
  throw new Error(`Invalid PORT specified: ${process.env.PORT}`);
}

if (isNaN(config.targetPort) || config.targetPort <= 0 || config.targetPort > 65535) {
  throw new Error(`Invalid TARGET_PORT specified: ${process.env.TARGET_PORT}`);
}

if (!config.targetHost) {
  throw new Error('TARGET_HOST must be specified.');
}
