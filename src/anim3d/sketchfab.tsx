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
 * `autostart=1` est le paramètre décisif : sans lui, Sketchfab affiche une
 * image fixe avec un bouton « play » et n'ouvre le lecteur qu'au clic — un
 * hero ne demande pas la permission de vivre. `autospin` fait tourner le
 * modèle, `annotation_cycle` déroule ses annotations une par une, et
 * `ui_theme=dark` accorde les commandes du lecteur au fond sombre.
 *
 * `transparent=1` est ce qui donne le fond NOIR, malgré son nom. Le fond
 * clair qu'on voyait vient du modèle lui-même : son auteur l'a réglé dans la
 * scène, et aucun paramètre d'URL ne le remplace — `ui_theme` ne colore que
 * les boutons du lecteur. En rendant le fond du lecteur transparent, c'est le
 * cadre du hero qu'on voit à travers, et lui est noir (`.hero`, styles.css).
 *
 * `dnt=1` demande à Sketchfab de ne pas pister le visiteur ; sans effet sur
 * l'affichage.
 */
export const SKETCHFAB_SRC =
  `https://sketchfab.com/models/${MODELE}/embed` +
  '?autospin=1&autostart=1&annotations_visible=1&preload=1' +
  '&annotation_cycle=5&ui_theme=dark&transparent=1&dnt=1';

export const SKETCHFAB_PAGE = `https://sketchfab.com/3d-models/ear-cross-section-${MODELE}`;

/**
 * Attributs hérités du code d'intégration de Sketchfab : les types JSX de
 * React ne les connaissent pas, on les passe donc par un spread.
 */
export const SKETCHFAB_ATTRIBUTS = {
  mozallowfullscreen: 'true',
  webkitallowfullscreen: 'true',
  'xr-spatial-tracking': '',
  'execution-while-out-of-viewport': '',
  'execution-while-not-rendered': '',
  'web-share': '',
} as Record<string, string>;

export type EtatSketchfab = 'verification' | 'joignable' | 'indisponible';

/** Le lecteur Sketchfab répond-il ? Revérifie dès que le réseau revient. */
export function useSketchfab(): EtatSketchfab {
  const [etat, setEtat] = useState<EtatSketchfab>('verification');

  useEffect(() => {
    let vivant = true;

    // `no-cors` : on ne lit pas la réponse (Sketchfab ne l'autoriserait pas),
    // on veut seulement savoir si la requête aboutit.
    function verifier() {
      fetch(SKETCHFAB_SRC, { mode: 'no-cors', cache: 'no-store' })
        .then(() => vivant && setEtat('joignable'))
        .catch(() => vivant && setEtat('indisponible'));
    }

    verifier();
    window.addEventListener('online', verifier);
    return () => {
      vivant = false;
      window.removeEventListener('online', verifier);
    };
  }, []);

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
