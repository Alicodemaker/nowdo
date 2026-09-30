import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// BASE_PATH is set by the GitHub Pages workflow (e.g. "/appstarter/").
// Locally it defaults to "/". Every URL below is derived from it, so the
// app, manifest and service worker all work under the repo subpath.
const base = process.env.BASE_PATH || '/'

// Content-Security-Policy for the built app: it may only run its own files and
// only talk to itself and Claude, so no injected code can send the Claude key
// anywhere else. Build only: the dev server needs inline styles for hot reload.
const csp = [
  "default-src 'self'",
  "connect-src 'self' https://api.anthropic.com",
  "img-src 'self' data:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

const contentSecurityPolicy = {
  name: 'content-security-policy',
  apply: 'build',
  // PROTOTYPE branch only: the local-AI page must download its model from
  // huggingface.co, so it gets no CSP. The app itself keeps the strict one.
  transformIndexHtml: (html, ctx) =>
    ctx.filename.endsWith('local-ai.prototype.html')
      ? html
      : [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' }],
}

export default defineConfig({
  base,
  // PROTOTYPE branch only: build the throwaway local-AI page next to the app.
  build: { rollupOptions: { input: { main: 'index.html', prototype: 'local-ai.prototype.html' } } },
  plugins: [
    contentSecurityPolicy,
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
        // PROTOTYPE branch only: the 6 MB local-AI engine stays out of the offline cache.
        globIgnores: ['**/prototype-*', '**/local-ai.prototype.html'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/local-ai\.prototype\.html/], // PROTOTYPE branch only
      },
    }),
  ],
})
