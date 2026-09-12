import 'dotenv/config';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const PORT = parseInt(process.env.PORT || '10000', 10);
const TARGET_HOST = process.env.TARGET_HOST || '157.85.94.60';
const TARGET_PORT = parseInt(process.env.TARGET_PORT || '20929', 10);

console.log(`[Door] Initializing Eaglercraft Gateway...`);
console.log(`[Door] Port: ${PORT}`);
console.log(`[Door] Target Server: ${TARGET_HOST}:${TARGET_PORT}`);

try {
  const eaglerproxy = require('eaglerproxy');
  const ProxyClass = eaglerproxy.Proxy || eaglerproxy.default || eaglerproxy;

  if (typeof ProxyClass === 'function') {
    const proxy = new ProxyClass({
      host: '0.0.0.0',
      port: PORT,
      server: {
        host: TARGET_HOST,
        port: TARGET_PORT,
      },
      motd: '&bEaglercraft 1.12 Gateway',
      skin: {
        enableCustomSkins: true,
      },
    });

    if (typeof proxy.start === 'function') {
      proxy.start();
    } else if (typeof proxy.listen === 'function') {
      proxy.listen();
    }
  } else if (typeof eaglerproxy.start === 'function') {
    eaglerproxy.start({
      host: '0.0.0.0',
      port: PORT,
      server: { host: TARGET_HOST, port: TARGET_PORT },
    });
  }

  console.log(`[Door] 🚪 Gateway is listening and ready for Eaglercraft connections!`);
} catch (err) {
  console.error('[Door] Fatal error during startup:', err);
  process.exit(1);
}
