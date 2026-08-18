import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import paquet from './package.json' with { type: 'json' };

// Version affichée = numéro du paquet + moment du build (celui de la CI à
// chaque déploiement). Le numéro dit quelle livraison est en ligne, l'heure
// confirme que le navigateur n'a pas gardé une vieille copie en cache.
const HORODATAGE = new Date()
  .toLocaleString('fr-CA', {
    timeZone: 'America/Toronto',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  .replace(',', '');

const VERSION = `${paquet.version} · ${HORODATAGE}`;

// Le site est publié sur https://frankyray21.github.io/Bruit/ — d'où le base.
// BASE_PATH=/ permet de servir la racine en local ou sur un autre hébergeur.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/Bruit/',
  define: {
    __VERSION__: JSON.stringify(VERSION),
  },
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
        // La vidéo (mp4) est incluse pour que l'animation joue au fond.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp4}'],
        // La vidéo dépasse la limite de précache par défaut (2 Mo) ; on la relève
        // pour qu'elle soit bien mise en cache. Coût : une installation plus
        // lourde, assumé puisqu'on veut l'animation hors-ligne.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // Sans ça, les précaches des versions précédentes s'accumulent et
        // peuvent servir des fichiers qui n'existent plus — d'où une page vide.
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
});
