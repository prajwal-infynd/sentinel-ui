import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/v1/crawler': {
        target: 'http://173.249.56.10:1234',
        changeOrigin: true,
        timeout: 300000,
        proxyTimeout: 300000,
      },
      '/sentinel-api': {
        target: 'https://sentinelapi.27x.ai',
        changeOrigin: true,
        secure: false,
        timeout: 300000,
        proxyTimeout: 300000,
        rewrite: (path) => path.replace(/^\/sentinel-api/, '')
      },
      '/croftz-api': {
        target: 'https://croftzgo.com',
        changeOrigin: true,
        secure: false,
        timeout: 300000,
        proxyTimeout: 300000,
        rewrite: (path) => path.replace(/^\/croftz-api/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.removeHeader('Origin');
            proxyReq.removeHeader('Referer');
            proxyReq.setHeader('Connection', 'close');
            // Forward the api key header if present
            const apiKey = req.headers['x-api-key'];
            if (apiKey) proxyReq.setHeader('x-api-key', apiKey);
          });
          proxy.on('error', (err, req, res) => {
            console.error('Proxy Error:', err);
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy Error', message: err.message }));
            }
          });
        }
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
}));
