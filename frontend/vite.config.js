import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local dev: Flask on this machine. In Docker-based dev, set VITE_DEV_PROXY_TARGET=http://backend:5000
const devBackend = process.env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:5000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // expose to Docker network
    port: 5173,
    watch: {
      usePolling: true,  // required for hot reload inside Docker
    },
    proxy: {
      '/api': {
        target: devBackend,
        changeOrigin: true,
      },
      '/auth': {
        target: devBackend,
        changeOrigin: true,
      },
      '/uploads': {
        target: devBackend,
        changeOrigin: true,
      },
      '/health': {
        target: devBackend,
        changeOrigin: true,
      },
    },
  },
})