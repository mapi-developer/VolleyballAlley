import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // This fixes the 'Blocked request' error you encountered
    allowedHosts: [
      'smelting-helpline-botanist.ngrok-free.dev',
      '.ngrok-free.app' // Optional: allows any ngrok tunnel
    ]
  }
})