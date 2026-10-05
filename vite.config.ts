/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const JEV_PROXY_PATH = '/api/jev'
const TYPESAFE_ORIGIN = 'https://api.typesafe.ai'

/**
 * TypeSafe only allows CORS from its own console, so the browser talks to /api/jev and this proxy
 * forwards the user's own `Authorization` header. TYPESAFE_API_KEY is an optional local-dev fallback.
 */
function jevProxy(fallbackKey: string | undefined): Record<string, ProxyOptions> {
  return {
    [JEV_PROXY_PATH]: {
      target: TYPESAFE_ORIGIN,
      changeOrigin: true,
      rewrite: () => '/v1/systemone',
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq, req) => {
          if (!req.headers.authorization && fallbackKey) proxyReq.setHeader('Authorization', `Bearer ${fallbackKey}`)
        })
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = jevProxy(env.TYPESAFE_API_KEY)

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: { proxy },
    preview: { proxy },
    test: {
      include: ['tests/**/*.test.ts'],
    },
  }
})
