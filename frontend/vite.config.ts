import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/productos': 'http://localhost:8080',
      '/movimientos': 'http://localhost:8080',
    },
  },
})
