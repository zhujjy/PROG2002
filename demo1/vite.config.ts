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
        enable: command === 'serve', // 只在开发模式下启用
        watchFiles: true, // 监听文件变化
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
        // 将静态上传资源代理到 PHP 开发服务器
        '/uploads': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
