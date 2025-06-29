import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/option-trial/",
  plugins: [react()],
  server: {
    proxy: {
      '/finMind': {
        target: 'https://api.finmindtrade.com/api/v4/data',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/finMind/, ''),
      }
    }
  }
})
