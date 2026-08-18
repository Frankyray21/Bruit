/**
 * Carte « animation vidéo » — hors-ligne et paramétrable.
 *
 * Dépose un fichier `.mp4` dans `public/videos/` (voir `LISEZMOI.md`) et la
 * carte le joue en boucle, muet (politique des navigateurs), avec les contrôles.
 * Deux emplacements sont prévus dans le module 4 :
 *   • `videoplayback.mp4` — « Le voyage du son » (NIDCD/NIH, domaine public)
 *   • `cellules.mp4`      — « Le bruit détruit la cellule ciliée »
 *
 * Si le fichier est absent ou illisible, la carte bascule sur un lien externe :
 * jamais de lecteur cassé.
 */

import { useEffect, useRef, useState } from 'react';
import { Carte } from '../ui/composants.js';

export interface AnimationSonProps {
  /** Nom du fichier dans `public/videos/` (ex. `videoplayback.mp4`). */
  readonly fichier: string;
  /** Titre de la carte. */
  readonly titre: string;
  /** Étiquette de source affichée en haut de la carte. */
  readonly source: string;
  /** Phrase d'intro sous le titre. */
  readonly intro: string;
  /** Lien externe de repli (et crédit de source). */
  readonly lien: string;
  /** Nom lisible de la source (bouton de repli + ligne de crédit). */
  readonly lienNom: string;
  /** Fin de la ligne de crédit (ex. « domaine public »). */
  readonly note: string;
}

export function AnimationSon({
  fichier,
  titre,
  source,
  intro,
  lien,
  lienNom,
  note,
}: AnimationSonProps) {
  // Repli sur le lien si le fichier est absent ou illisible : jamais de player
  // cassé. On met la source directement sur <video> pour que `onError` se
  // déclenche de façon fiable quand le fichier manque.
  const [erreur, setErreur] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const url = `${import.meta.env.BASE_URL}videos/${fichier}`;

  // `autoplay` seul ne suffit pas partout : plusieurs navigateurs diffèrent le
  // démarrage tant que la vidéo est hors écran, et iOS l'oublie après un
  // retour d'arrière-plan. On relance donc la lecture dès que la carte entre
  // dans l'écran. Un refus (mode économie d'énergie, réglage du système) est
  // sans conséquence : les contrôles restent là.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting && el.paused) el.play().catch(() => {});
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [erreur]);

  return (
    <Carte titre={titre} source={source} intro={intro}>
      {!erreur ? (
        <video
          ref={video}
          className="video-son"
          src={url}
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setErreur(true)}
        />
      ) : (
        <a
          className="bouton"
          href={lien}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }}
        >
          Voir l'animation sur {lienNom} ↗
        </a>
      )}

      <p className="carte__source" style={{ marginTop: 12, display: 'block' }}>
        Source :{' '}
        <a href={lien} target="_blank" rel="noopener noreferrer">
          {lienNom}
        </a>{' '}
        — {note}.
      </p>
    </Carte>
  );
}
