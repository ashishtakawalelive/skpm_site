import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/client-dashboard/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: '../client-dashboard',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('@dnd-kit')) return 'dnd'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})
