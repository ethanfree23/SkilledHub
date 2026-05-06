import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

export default defineConfig(({ mode }) => ({
  // Capacitor loads assets from file:// — relative base. Web builds use absolute '/'.
  base: mode === 'capacitor' ? './' : '/',
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
}))