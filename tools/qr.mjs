// Génère public/qr.svg : le code QR de l'adresse publique du site, pour
// l'afficher en salle (mode Projeter) et dans la carte d'installation.
//
//   npm run qr                      → adresse par défaut
//   npm run qr -- https://mon.site/ → autre adresse
//
// Le SVG est produit une fois et versionné : rien n'est calculé ni chargé
// depuis le réseau à l'exécution — l'app reste 100 % hors-ligne.
import { writeFileSync } from 'node:fs';
import QRCode from 'qrcode';

const url = process.argv[2] ?? 'https://frankyray21.github.io/Bruit/';
const svg = await QRCode.toString(url, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 1,
  color: { dark: '#0a0e17', light: '#ffffff' },
});
const cible = new URL('../public/qr.svg', import.meta.url);
writeFileSync(cible, svg);
console.log(`qr.svg écrit pour ${url}`);
