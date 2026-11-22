import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080/game-store',
        changeOrigin: true,
        secure: false,
      },
      '/assets': {
        target: 'http://localhost:8080/game-store',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
