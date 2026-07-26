import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';

// Identité Machines Roger : Barlow Condensed (titres) + Barlow (texte).
// Empaquetées en local (@fontsource) → le site reste hors-ligne.
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow/700.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow-condensed/800.css';

import './styles.css';

const racine = document.getElementById('root');
if (!racine) throw new Error('Élément #root introuvable');

createRoot(racine).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Toujours à jour : quand un nouveau service worker prend le contrôle (nouveau
// déploiement), on recharge une fois pour servir la dernière version. Combiné à
// skipWaiting/clientsClaim, l'utilisateur n'a jamais une version périmée.
if ('serviceWorker' in navigator) {
  let dejaRecharge = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (dejaRecharge) return;
    dejaRecharge = true;
    location.reload();
  });
}
