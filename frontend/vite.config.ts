import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow access from network/domain
    port: 5173,
    strictPort: true,
    proxy: {
      // If you need to proxy API requests
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    cors: {
      origin: 'grammalogue.harshwardhan.tech', // Allow this domain
    }
  },
});