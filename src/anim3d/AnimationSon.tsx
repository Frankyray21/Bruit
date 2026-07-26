/**
 * Animation « Le voyage du son » — intégrée en lecture dans le module 4.
 *
 * La vidéo est hébergée localement (`public/videos/videoplayback.mp4`), donc
 * elle fonctionne hors-ligne comme le reste du site. Elle démarre en boucle,
 * muette (politique des navigateurs), avec les contrôles pour activer le son.
 *
 * Source : animation de la NIDCD (NIH), du domaine public — attribution
 * appréciée, on la crédite.
 */

import { useState } from 'react';
import { Carte } from '../ui/composants.js';

const PAGE_NIDCD =
  'https://www.nidcd.nih.gov/news/multimedia/journey-of-sound-video';

const VIDEO_LOCALE = `${import.meta.env.BASE_URL}videos/videoplayback.mp4`;

export function AnimationSon() {
  // Repli sur le lien si le fichier est absent ou illisible : jamais de player
  // cassé.
  const [erreur, setErreur] = useState(false);

  return (
    <Carte
      titre="Le voyage du son"
      source="NIDCD · NIH"
      intro="Le son de l'oreille jusqu'au cerveau, cellules ciliées comprises. Touche le son pour l'activer."
    >
      {!erreur ? (
        <video
          className="video-son"
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setErreur(true)}
        >
          <source src={VIDEO_LOCALE} type="video/mp4" />
        </video>
      ) : (
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
        — domaine public.
      </p>
    </Carte>
  );
}
