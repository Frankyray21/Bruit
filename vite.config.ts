import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Le site est publié sur https://frankyray21.github.io/Bruit/ — d'où le base.
// BASE_PATH=/ permet de servir la racine en local ou sur un autre hébergeur.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/Bruit/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Bruit — Protection auditive',
        short_name: 'Bruit',
        description:
          'Formation interactive sur la protection auditive en milieu minier',
        lang: 'fr-CA',
        theme_color: '#c8102e',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icone-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Tout doit être disponible hors-ligne : il n'y a pas de réseau sous terre.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
});
