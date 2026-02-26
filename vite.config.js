import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import removeNoMatch from 'vite-plugin-router-warn'
import { pluginIcons, pluginPagePathes } from './build/plugin-isme'
import yamlEnvPlugin, { loadYamlConfig } from './build/vite-yaml-env-plugin'

export default defineConfig(({ mode }) => {
  const viteEnv = loadEnv(mode, process.cwd())
  const yamlConfig = loadYamlConfig(mode)

  const VITE_PUBLIC_PATH = yamlConfig?.vite?.publicPath || viteEnv.VITE_PUBLIC_PATH || '/'
  const VITE_PROXY_TARGET = yamlConfig?.proxy?.target || viteEnv.VITE_PROXY_TARGET || 'http://localhost:8085'

  return {
    base: VITE_PUBLIC_PATH || '/',
    plugins: [
      yamlEnvPlugin(),
      Vue(),
      VueJsx(),
      Unocss(),
      AutoImport({
        imports: ['vue', 'vue-router'],
        dts: 'src/auto-imports.d.ts'
      }),
      Components({
        resolvers: [NaiveUiResolver()],
        dts: false
      }),
      // 自定义插件，用于生成页面文件的path，并添加到虚拟模块
      pluginPagePathes(),
      // 自定义插件，用于生成自定义icon，并添加到虚拟模块
      pluginIcons(),
      // 移除非必要的vue-router动态路由警告: No match found for location with path
      removeNoMatch()
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
        '~': path.resolve(process.cwd())
      }
    },
    server: {
      host: '0.0.0.0',
      port: 3200,
      open: true,
      // 禁用热更新时浏览器自动聚焦
      hmr: {
        protocol: 'ws', // 使用ws协议避免http触发的焦点问题
        focus: false
      },
      proxy: {
        '/api': {
          target: VITE_PROXY_TARGET,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
          configure: (proxy, options) => {
            // 配置此项可在响应头中看到请求的真实地址
            proxy.on('proxyRes', (proxyRes, req) => {
              proxyRes.headers['x-real-url'] = new URL(req.url || '', options.target)?.href || ''
            })
          }
        }
      }
    },
    optimizeDeps: {
      include: ['vue3-intro-step']
    },
    build: {
      chunkSizeWarningLimit: 1024 // chunk 大小警告的限制（单位kb）
    }
  }
})
