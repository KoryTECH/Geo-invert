import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev server must be reachable through Codespaces port forwarding (host: true)
// and proxy API traffic to the C++ backend on :8080.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/health': 'http://localhost:8080',
    },
  },
})
