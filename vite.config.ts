import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), // <--- Ensure this is here for Tailwind v4
  ],
  server: {
    port: 3000, // <--- THIS FIXES THE CORS ERROR
  }
})