import { defineConfig } from 'vite';
import { qrcode } from 'vite-plugin-qrcode';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: { overlay: true },
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  plugins: [
    qrcode()         // Shows a QR code in terminal for mobile scanning
  ]
});
