import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/**
 * Local Dev Middleware that runs Vercel's /api/shopify/* serverless functions
 * inside Vite directly so voltalit/ is 100% independent of the Website/ backup.
 */
function localShopifyApiPlugin() {
  return {
    name: 'local-shopify-api',
    configureServer(server) {
      // Load non-VITE_ environment variables into Node process.env ONLY (never bundled to browser)
      const env = loadEnv(server.config.mode || 'development', process.cwd(), '');
      for (const [key, value] of Object.entries(env)) {
        if (key.startsWith('SHOPIFY_') && !process.env[key]) {
          process.env[key] = value;
        }
      }

      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || '').split('?')[0];

        let modulePath = null;
        if (pathname === '/api/shopify/products') {
          modulePath = '/api/shopify/products.js';
        } else if (pathname === '/api/shopify/cart/create') {
          modulePath = '/api/shopify/cart/create.js';
        }

        if (!modulePath) {
          return next();
        }

        // Decorate Node ServerResponse with Vercel-compatible .status() and .json()
        if (!res.status) {
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
        }
        if (!res.json) {
          res.json = (payload) => {
            if (!res.getHeader('Content-Type')) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
            }
            res.end(JSON.stringify(payload));
            return res;
          };
        }

        try {
          const mod = await server.ssrLoadModule(modulePath);
          await mod.default(req, res);
        } catch (err) {
          console.error(`[Vite Shopify Middleware Error] ${pathname}:`, err);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ success: false, error: err.message || 'Internal dev API error' }));
          }
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localShopifyApiPlugin()],
});
