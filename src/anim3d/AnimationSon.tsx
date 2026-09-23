/**
 * Carte « animation vidéo » — hors-ligne et paramétrable.
 *
 * Dépose un fichier `.mp4` dans `public/videos/` (voir `LISEZMOI.md`) et la
 * carte le joue en boucle, muet (politique des navigateurs), avec les contrôles.
 * Deux emplacements sont prévus dans le module 4 :
 *   • `videoplayback.mp4` — « Le voyage du son » (NIDCD/NIH, domaine public)
 *   • `cellules.mp4`      — « Le bruit détruit la cellule ciliée »
 *
 * Si le fichier est absent ou illisible, la carte bascule sur un lien externe
 * (jamais de lecteur cassé) — ou, pour un clip optionnel, ne s'affiche pas.
 */

import { useState } from 'react';
import { Avertissement, Carte } from '../ui/composants.js';

const REDUIT =
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  /** Clip facultatif : sans fichier, la carte disparaît au lieu d'un lien. */
  readonly optionnel?: boolean;
}

export function AnimationSon({
  fichier,
  titre,
  source,
  intro,
  lien,
  lienNom,
  note,
  optionnel = false,
}: AnimationSonProps) {
  // Repli sur le lien si le fichier est absent ou illisible : jamais de player
  // cassé. On met la source directement sur <video> pour que `onError` se
  // déclenche de façon fiable quand le fichier manque.
  const [erreur, setErreur] = useState(false);
  const url = `${import.meta.env.BASE_URL}videos/${fichier}`;

  if (erreur && optionnel) return null;

  return (
    <Carte titre={titre} source={source} intro={intro}>
      {!erreur ? (
        <video
          className="video-son"
          src={url}
          controls
          autoPlay={!REDUIT}
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setErreur(true)}
        />
      ) : (
        <Avertissement>
          La vidéo ne peut pas être lue sur cet appareil. Le message reste le
          même : le son fait vibrer le tympan, puis les cellules ciliées de la
          cochlée — celles que le bruit détruit. Avec du réseau, tu peux la voir
          sur{' '}
          <a href={lien} target="_blank" rel="noopener noreferrer">
            {lienNom}
          </a>
          .
        </Avertissement>
      )}

      <p className="carte__source carte__source--credit" style={{ marginTop: 12 }}>
        Source :{' '}
        <a href={lien} target="_blank" rel="noopener noreferrer">
          {lienNom}
        </a>{' '}
        — {note}.
      </p>
    </Carte>
  );
}
