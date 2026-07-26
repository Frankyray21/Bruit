/**
 * « Le voyage du son » — animation officielle de la NIDCD (NIH).
 *
 * Ressource du domaine public (production d'une agence fédérale américaine) :
 * réutilisable sans redevance, l'attribution étant appréciée mais non exigée.
 * On la crédite quand même, c'est correct.
 *
 * Deux contraintes gérées ici :
 *  - le site est hors-ligne : le lien vers la NIDCD n'est qu'un « pour aller
 *    plus loin », le cœur anatomique reste couvert par la coupe SVG et la 3D ;
 *  - la vidéo peut être hébergée localement : si le fichier
 *    `public/videos/voyage-du-son.mp4` est présent, la carte le joue au lieu
 *    d'afficher le lien. Sinon, elle affiche le lien, sans player cassé.
 */

import { useRef, useState } from 'react';
import { Carte } from '../ui/composants.js';

const PAGE_NIDCD =
  'https://www.nidcd.nih.gov/news/multimedia/journey-of-sound-video';

// Chemin de la vidéo si tu la déposes toi-même (voir README). BASE_URL gère
// le préfixe /Bruit/ du déploiement.
const VIDEO_LOCALE = `${import.meta.env.BASE_URL}videos/voyage-du-son.mp4`;

export function AnimationSon() {
  // On démarre sur le lien ; on ne bascule sur la vidéo que si elle se charge
  // vraiment. Pas de player cassé quand le fichier est absent.
  const [aVideo, setAVideo] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  return (
    <Carte
      titre="Pour aller plus loin : le voyage du son"
      source="NIDCD · NIH"
      intro="Une animation officielle qui suit le son de l'oreille jusqu'au cerveau, cellules ciliées comprises."
    >
      {/* Sonde discrète : si le fichier local existe, on passe en mode vidéo. */}
      <video
        ref={video}
        className="video-son"
        style={{ display: aVideo ? 'block' : 'none' }}
        controls={aVideo}
        preload="metadata"
        playsInline
        onCanPlay={() => setAVideo(true)}
        onError={() => setAVideo(false)}
      >
        <source src={VIDEO_LOCALE} type="video/mp4" />
      </video>

      {!aVideo && (
        <a
          className="bouton"
          href={PAGE_NIDCD}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }}
        >
          Voir l'animation sur le site de la NIDCD ↗
        </a>
      )}

      <p className="carte__source" style={{ marginTop: 12, display: 'block' }}>
        Source :{' '}
        <a href={PAGE_NIDCD} target="_blank" rel="noopener noreferrer">
          NIDCD, National Institutes of Health
        </a>{' '}
        — domaine public. Ce lien s'ouvre en ligne ; le reste du site fonctionne
        sans réseau.
      </p>
    </Carte>
  );
}
