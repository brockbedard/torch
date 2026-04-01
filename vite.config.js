import { defineConfig } from 'vite';
import { qrcode } from 'vite-plugin-qrcode';

export default defineConfig({
  server: {
    host: true,      // Always listen on network (0.0.0.0)
    port: 5173,      // Consistent port
    strictPort: true // Fail if 5173 is taken (prevents 5174/5175 confusion)
  },
  plugins: [
    qrcode()         // Shows a QR code in terminal for mobile scanning
  ]
});
