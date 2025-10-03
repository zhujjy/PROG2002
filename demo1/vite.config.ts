import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { viteMockServe } from 'vite-plugin-mock'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      vue(),
      viteMockServe({
        mockPath: 'mock',
        enable: command === 'serve', 
        watchFiles: true, 
        localEnabled: command === 'serve',
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 5176,
      open: false,
      proxy: {
        '/api': {
          target: 'http://localhost:5051',
          changeOrigin: true,
          secure: false
        },

        '/uploads': {
          target: 'http://localhost:5051',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
