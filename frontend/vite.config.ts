import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const tenantSlug = env.VITE_DEFAULT_TENANT_SLUG || 'amf'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('X-Tenant-Slug', tenantSlug)
            })
          },
        },
        '/uploads': { target: 'http://localhost:8000', changeOrigin: true },
      },
    },
  }
})
