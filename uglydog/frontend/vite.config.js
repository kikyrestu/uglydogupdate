import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000, // 👈 Ubah ini jadi port yang kamu mau (contoh: 3000, 8001, dll)
    host: 'localhost', // (optional) bisa juga diganti jadi true kalau mau LAN
  },
  plugins: [react(),
    tailwindcss(),
  ],
})
