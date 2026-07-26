/**
 * Carte « modèle 3D anatomique » — optionnelle et paramétrable.
 *
 * Dépose un fichier `.glb` dans `public/models/` (voir `LISEZMOI.md`) et cette
 * carte l'affiche dans une visionneuse qu'on tourne au doigt. Deux emplacements
 * sont prévus dans le module 4 :
 *   • `oreille.glb`  — l'oreille complète (externe + interne)
 *   • `cellules.glb` — les cellules ciliées / l'organe de Corti
 *
 * Si le fichier est absent, la carte montre un repli propre avec un lien vers
 * NIH 3D (domaine public), jamais une scène vide ni une erreur bruyante.
 */

import { useEffect, useRef, useState } from 'react';
import { creerVisionneuse, type VisionneuseGlb } from './sceneGlb.js';
import { Carte } from '../ui/composants.js';

const NIH_3D = 'https://3d.nih.gov/';

const REDUIT =
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

type Etat = 'chargement' | 'pret' | 'absent';

export interface ModeleGlbProps {
  /** Nom du fichier dans `public/models/` (ex. `oreille.glb`). */
  readonly fichier: string;
  /** Titre de la carte quand le modèle est présent. */
  readonly titre: string;
  /** Phrase d'intro sous le titre quand le modèle est présent. */
  readonly intro: string;
  /** Ce qu'on cherche, pour le texte du repli (ex. « de l'oreille »). */
  readonly sujet: string;
  /** Étiquette d'accessibilité de la visionneuse. */
  readonly aria: string;
  /** Terme à chercher sur NIH 3D dans le repli (ex. « ear », « cochlea »). */
  readonly recherche: string;
}

export default function ModeleGlb({
  fichier,
  titre,
  intro,
  sujet,
  aria,
  recherche,
}: ModeleGlbProps) {
  const conteneur = useRef<HTMLDivElement>(null);
  const [etat, setEtat] = useState<Etat>('chargement');

  useEffect(() => {
    let visionneuse: VisionneuseGlb | null = null;
    let annule = false;

    const url = `${import.meta.env.BASE_URL}models/${fichier}`;
    creerVisionneuse(conteneur.current!, url, !REDUIT)
      .then((v) => {
        if (annule) {
          v.detruire();
          return;
        }
        visionneuse = v;
        setEtat('pret');

        const el = conteneur.current!;
        let dernier: { x: number; y: number } | null = null;
        el.addEventListener('pointerdown', (e) => {
          dernier = { x: e.clientX, y: e.clientY };
          el.setPointerCapture(e.pointerId);
        });
        el.addEventListener('pointermove', (e) => {
          if (!dernier) return;
          v.tourner(e.clientX - dernier.x, e.clientY - dernier.y);
          dernier = { x: e.clientX, y: e.clientY };
        });
        const relacher = () => (dernier = null);
        el.addEventListener('pointerup', relacher);
        el.addEventListener('pointercancel', relacher);
      })
      .catch(() => {
        // Fichier absent ou illisible : repli, pas d'erreur bruyante.
        if (!annule) setEtat('absent');
      });

    return () => {
      annule = true;
      visionneuse?.detruire();
    };
  }, [fichier]);

  if (etat === 'absent') {
    return (
      <Carte titre={titre} source="optionnel">
        <p className="carte__intro" style={{ marginBottom: 12 }}>
          Tu peux afficher ici un vrai modèle 3D {sujet}. Récupère un fichier{' '}
          <strong>.glb</strong> du domaine public sur NIH 3D et dépose-le dans le
          site sous le nom <code>{fichier}</code> (voir le fichier LISEZMOI du
          dépôt).
        </p>
        <a
          className="bouton"
          href={`${NIH_3D}search?q=${encodeURIComponent(recherche)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }}
        >
          Trouver un modèle sur NIH 3D ↗
        </a>
        <p className="carte__source" style={{ marginTop: 12, display: 'block' }}>
          NIH 3D héberge des modèles anatomiques, souvent du domaine public,
          téléchargeables en .glb.
        </p>
      </Carte>
    );
  }

  return (
    <Carte titre={titre} source="glb local" intro={intro}>
      <div
        ref={conteneur}
        className="scene3d"
        role="img"
        aria-label={aria}
        style={{ visibility: etat === 'pret' ? 'visible' : 'hidden' }}
      />
    </Carte>
  );
}
