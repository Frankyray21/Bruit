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

// Toujours à jour : quand un NOUVEAU service worker prend le contrôle (nouveau
// déploiement), on recharge une fois pour servir la dernière version. Combiné à
// skipWaiting/clientsClaim, l'utilisateur n'a jamais une version périmée.
//
// À la toute première visite, le service worker prend aussi le contrôle
// (clientsClaim) : là, on ne recharge pas — rien n'est périmé, et un
// rechargement surprise en pleine lecture serait incompréhensible. Tout ce que
// le travailleur fait est de toute façon mémorisé (zone, module, quiz, quart).
if ('serviceWorker' in navigator) {
  const avaitControleur = navigator.serviceWorker.controller !== null;
  let dejaRecharge = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!avaitControleur || dejaRecharge) return;
    dejaRecharge = true;
    location.reload();
  });
}
