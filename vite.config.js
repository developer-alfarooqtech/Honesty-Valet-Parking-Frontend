import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  build:{
    outDir: '../Honesty-Valet-Parking-Backend/view',
    emptyOutDir:true,
  },
  server:{
    port:3000,
    open:false,
  },
})
