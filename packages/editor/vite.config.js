import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/editor/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@leo-lynt/lynt-flow-core': fileURLToPath(new URL('../core/src', import.meta.url)),
      '@core-methods': fileURLToPath(new URL('../core/src/methods', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      external: ['redis'] // RedisAdapter não é usado no frontend
    }
  },
  server: {
    port: 5175,
    fs: {
      // Allow serving files from lib directory (2 levels up from frontend)
      allow: ['..', '../..']
    }
  }
})
