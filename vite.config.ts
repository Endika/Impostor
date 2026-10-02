import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8')) as {
  version: string
}

export default defineConfig({
  base: '/Impostor/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Impostor',
        short_name: 'Impostor',
        description: 'Offline party game — find the impostor. No login.',
        theme_color: '#0d1020',
        background_color: '#0d1020',
        display: 'standalone',
        // An explicit id lets Chrome offer a clean install again after an
        // uninstall it never registered.
        id: '/Impostor/?app=impostor',
        start_url: '/Impostor/',
        scope: '/Impostor/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,svg,png,ico,woff2}'],
        // The six locales are Latin script; leave the other Rubik subsets to
        // load on demand instead of precaching them.
        globIgnores: ['**/rubik-{arabic,cyrillic,cyrillic-ext,hebrew,greek}-*.woff2'],
        navigateFallback: '/Impostor/index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: { sourcemap: true, target: 'es2022' },
})
