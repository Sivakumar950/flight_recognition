import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/predict': {
        target: 'https://YOUR_API_GATEWAY_URL',
        changeOrigin: true,
      }
    }
  }
})
