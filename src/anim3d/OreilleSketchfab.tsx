/**
 * Coupe de l'oreille en 3D — modèle Sketchfab annoté, intégré par iframe.
 *
 * Complète la coupe SVG (dessinée en code, toujours disponible) et la cochlée
 * Three.js : ici, un vrai modèle anatomique qui tourne tout seul et déroule ses
 * annotations une par une (`autospin`, `annotation_cycle`).
 *
 * Seule carte du site à dépendre du réseau : le lecteur Sketchfab vient de
 * chez eux et le service worker ne peut pas le mettre en cache. Au fond de la
 * mine — ou derrière un filtre d'entreprise — il ne chargerait pas. On teste
 * donc que le lecteur est joignable avant de poser le cadre, sinon la carte
 * affiche un lien : jamais de rectangle blanc au milieu d'une page sombre.
 * Le reste du module (SVG, 3D locale) reste entièrement hors-ligne.
 *
 * `dnt=1` demande à Sketchfab de ne pas pister le visiteur.
 */

import { useEffect, useState } from 'react';
import { Carte } from '../ui/composants.js';

const MODELE = '4f5438fc9337454587ec4a2c30c8c42f';

const SRC =
  `https://sketchfab.com/models/${MODELE}/embed` +
  '?autospin=1&annotations_visible=1&preload=1&annotation_cycle=5&ui_theme=dark&dnt=1';

const PAGE = `https://sketchfab.com/3d-models/ear-cross-section-${MODELE}`;

// Attributs hérités du code d'intégration de Sketchfab : les types JSX de React
// ne les connaissent pas, on les passe donc par un spread.
const ATTRIBUTS_LEGACY = {
  mozallowfullscreen: 'true',
  webkitallowfullscreen: 'true',
  'xr-spatial-tracking': '',
  'execution-while-out-of-viewport': '',
  'execution-while-not-rendered': '',
  'web-share': '',
} as Record<string, string>;

type Etat = 'verification' | 'joignable' | 'indisponible';

export function OreilleSketchfab() {
  const [etat, setEtat] = useState<Etat>('verification');
  // L'iframe reste transparente tant que le lecteur n'a pas répondu, pour ne
  // pas montrer sa page blanche pendant le chargement.
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    let vivant = true;

    // `no-cors` : on ne lit pas la réponse (Sketchfab ne l'autoriserait pas),
    // on veut seulement savoir si la requête aboutit. Elle échoue hors-ligne,
    // derrière un pare-feu, ou si le service est en panne.
    function verifier() {
      setEtat('verification');
      fetch(SRC, { mode: 'no-cors', cache: 'no-store' })
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

  return (
    <Carte
      titre="La coupe de l'oreille en 3D"
      source="diapo 11"
      intro="Le même trajet, sur un modèle anatomique : il tourne tout seul et ses annotations défilent. Fais glisser pour le tourner toi-même."
    >
      {etat === 'indisponible' ? (
        <a
          className="bouton"
          href={PAGE}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }}
        >
          Hors ligne — voir le modèle sur Sketchfab ↗
        </a>
      ) : (
        <div className="sketchfab-embed-wrapper">
          {!charge && (
            <p className="sketchfab-embed-wrapper__attente">
              Chargement du modèle 3D…
            </p>
          )}
          {etat === 'joignable' && (
            <iframe
              className={charge ? 'est-chargee' : ''}
              title="Coupe de l'oreille"
              src={SRC}
              allowFullScreen
              allow="autoplay; fullscreen; xr-spatial-tracking"
              onLoad={() => setCharge(true)}
              {...ATTRIBUTS_LEGACY}
            />
          )}
        </div>
      )}

      <p className="carte__source" style={{ marginTop: 12, display: 'block' }}>
        <a href={PAGE} target="_blank" rel="nofollow noopener noreferrer">
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
        <a
          href="https://sketchfab.com"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          Sketchfab
        </a>{' '}
        — vérifie la licence avant réutilisation.
      </p>
    </Carte>
  );
}
