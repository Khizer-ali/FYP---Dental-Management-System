import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
        target: 'http://dms-backend:5000',   // use container name, not localhost
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://dms-backend:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://dms-backend:5000',
        changeOrigin: true,
      },
    },
  },
})