import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5219',
      '/images': 'http://localhost:5219' // ให้รูปของสินค้าโหลดผ่าน proxy ได้เลย
    }
  }
})
