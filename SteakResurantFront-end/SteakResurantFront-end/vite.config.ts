import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 🎯 เพิ่มส่วนนี้เข้ามาเพื่อการ Deploy ใช้งานจริง
  base: '/cs67/react/s12/SteakRestaurant/',

  plugins: [react()],

  // ⚙️ ส่วนนี้สำหรับการ "พัฒนา" (npm run dev) ให้เรียก API ได้ถูกต้อง
  server: {
    proxy: {
      '/api': 'http://localhost:5219',
      '/images': 'http://localhost:5219' // ให้รูปของสินค้าโหลดผ่าน proxy ได้เลย
    }
  }
})