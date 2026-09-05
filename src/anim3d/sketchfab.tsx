/**
 * Le modèle Sketchfab « Ear cross-section » : URL, attributs, disponibilité.
 *
 * Seule ressource du site qui dépend du réseau — le lecteur vient de chez
 * Sketchfab et le service worker ne peut pas le mettre en cache. On vérifie
 * donc qu'il est joignable avant de poser le cadre : hors-ligne, au fond de la
 * mine ou derrière un filtre d'entreprise, l'appelant montre autre chose
 * plutôt qu'un rectangle blanc.
 *
 * `dnt=1` demande à Sketchfab de ne pas pister le visiteur.
 */

import { useEffect, useState } from 'react';

const MODELE = '4f5438fc9337454587ec4a2c30c8c42f';

/**
 * Pas de rotation ni de lancement automatiques. L'utilisateur choisit aussi
 * quand charger le lecteur externe. `dnt=1` demande de limiter le suivi,
 * sans constituer une garantie sur les pratiques du service tiers.
 */
export const SKETCHFAB_SRC =
  `https://sketchfab.com/models/${MODELE}/embed` +
  '?autospin=0&autostart=0&annotations_visible=1&preload=0' +
  '&ui_theme=dark&transparent=1&dnt=1';

export const SKETCHFAB_PAGE = `https://sketchfab.com/3d-models/ear-cross-section-${MODELE}`;

export type EtatSketchfab = 'verification' | 'joignable' | 'indisponible';

/** Le lecteur Sketchfab répond-il ? Revérifie dès que le réseau revient. */
export function useSketchfab(actif = false): EtatSketchfab {
  const [etat, setEtat] = useState<EtatSketchfab>('verification');

  useEffect(() => {
    if (!actif) return;
    let vivant = true;
    let controle: AbortController | undefined;
    let delai: ReturnType<typeof setTimeout> | undefined;

    // `no-cors` : on ne lit pas la réponse (Sketchfab ne l'autoriserait pas),
    // on veut seulement savoir si la requête aboutit.
    function verifier() {
      controle?.abort();
      clearTimeout(delai);
      if (!navigator.onLine) { setEtat('indisponible'); return; }
      setEtat('verification');
      controle = new AbortController();
      const signal = controle.signal;
      delai = setTimeout(() => { controle?.abort(); if (vivant) setEtat('indisponible'); }, 5000);
      fetch(SKETCHFAB_SRC, { mode: 'no-cors', cache: 'no-store', signal })
        .then(() => vivant && !signal.aborted && setEtat('joignable'))
        .catch(() => vivant && !signal.aborted && setEtat('indisponible'))
        .finally(() => { if (!signal.aborted) clearTimeout(delai); });
    }

    verifier();
    window.addEventListener('online', verifier);
    return () => {
      vivant = false;
      controle?.abort();
      clearTimeout(delai);
      window.removeEventListener('online', verifier);
    };
  }, [actif]);

  return etat;
}

/** Crédit d'auteur — exigé par la licence du modèle. */
export function CreditSketchfab({ className }: { className?: string }) {
  return (
    <p className={className}>
      <a href={SKETCHFAB_PAGE} target="_blank" rel="nofollow noopener noreferrer">
        Ear cross-section
      </a>{' '}
      par{' '}
      <a
        href="https://sketchfab.com/Ebers"
        target="_blank"
        rel="nofollow noopener noreferrer"
      >
        Ebers
      </a>{' '}
      sur{' '}
      <a href="https://sketchfab.com" target="_blank" rel="nofollow noopener noreferrer">
        Sketchfab
      </a>
    </p>
  );
}
