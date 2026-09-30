import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// BASE_PATH is set by the GitHub Pages workflow (e.g. "/appstarter/").
// Locally it defaults to "/". Every URL below is derived from it, so the
// app, manifest and service worker all work under the repo subpath.
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Do Now',
        short_name: 'Do Now',
        description: 'One tiny step, one tap to start.',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        // Keep in sync with --color-bg (light) in src/theme.css
        background_color: '#f6f3fb',
        theme_color: '#f6f3fb',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the whole build so the app works offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
