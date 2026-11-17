import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    // Allow access through a temporary tunnel link (dev only)
    allowedHosts: true,
  },
})
