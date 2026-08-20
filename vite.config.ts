import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { fileURLToPath } from 'node:url'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// mode "phone" (npm run dev:phone): HTTPS on the LAN so a phone gets geolocation
// (secure context is required for GPS outside localhost). Self-signed cert:
// accept the browser warning once on the phone.
export default defineConfig(({ mode }) => {
  const phone = mode === 'phone'
  return {
    // GitHub Pages serves the app from /<repo>/, dev and file:// from /
    base: process.env.PARKOVE_BASE ?? '/',
    plugins: [react(), ...(phone ? [basicSsl()] : [])],
    server: {
      port: phone ? 5184 : 5183,
      strictPort: true,
      host: phone ? true : undefined,
    },
    build: {
      rollupOptions: {
        input: {
          app: r('index.html'),
          catalog: r('catalog.html'),
        },
      },
    },
  }
})
