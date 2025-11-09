import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// vite.config.js do CMS
export default defineConfig({
  base: '/',
  plugins: [vue()],
  build: {
    // Usar esbuild para minificação (padrão do Vite, mais rápido)
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        // Separar vendors em chunks para melhor cache
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-vendor';
            }
            if (id.includes('@vue-flow')) {
              return 'vue-flow';
            }
            if (id.includes('axios') || id.includes('jwt-decode') || id.includes('uuid')) {
              return 'utils';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5174,
    proxy: {
      // Proxy para o editor (SEM rewrite - mantém /editor no path)
      '^/editor': {
        target: 'http://localhost:5175',
        changeOrigin: true,
        ws: true,
      },
      // Proxy para docs (SEM rewrite - mantém /docs no path)
      '^/docs': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        ws: true,
      },
      // Proxy para API
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
