import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// 1. Import the new optimization plugins
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import lqip from 'vite-plugin-lqip'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // 2. Add the lazy-loading placeholder plugin first
    lqip(),
    // 3. Add the image optimizer to convert and shrink your homepage assets
    ViteImageOptimizer({
      webp: {
        quality: 80, // Compresses files down cleanly without visible quality loss
      },
      jpeg: {
        quality: 75,
      },
    }),
    vue(),
    vueDevTools(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // This forces Vite to use the modern Sass API
        api: 'modern-compiler',
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
