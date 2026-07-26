/**
 * Carte « modèle 3D anatomique » — optionnelle.
 *
 * Si tu déposes un fichier `public/models/oreille.glb` (voir
 * `public/models/LISEZMOI.md`), la carte l'affiche dans une visionneuse qu'on
 * tourne au doigt. Sinon, elle montre un repli propre avec un lien vers NIH 3D,
 * où trouver des modèles anatomiques du domaine public.
 */

import { useEffect, useRef, useState } from 'react';
import { creerVisionneuse, type VisionneuseGlb } from './sceneGlb.js';
import { Carte } from '../ui/composants.js';

const URL_MODELE = `${import.meta.env.BASE_URL}models/oreille.glb`;
const NIH_3D = 'https://3d.nih.gov/';

const REDUIT =
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

type Etat = 'chargement' | 'pret' | 'absent';

export default function ModeleGlb() {
  const conteneur = useRef<HTMLDivElement>(null);
  const [etat, setEtat] = useState<Etat>('chargement');

  useEffect(() => {
    let visionneuse: VisionneuseGlb | null = null;
    let annule = false;

    creerVisionneuse(conteneur.current!, URL_MODELE, !REDUIT)
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
  }, []);

  if (etat === 'absent') {
    return (
      <Carte titre="Un modèle 3D anatomique" source="optionnel">
        <p className="carte__intro" style={{ marginBottom: 12 }}>
          Tu peux afficher ici un vrai modèle 3D de l'oreille. Récupère un
          fichier <strong>.glb</strong> du domaine public sur NIH 3D et dépose-le
          dans le site (voir le fichier LISEZMOI du dépôt).
        </p>
        <a
          className="bouton"
          href={NIH_3D}
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
    <Carte
      titre="Modèle 3D de l'oreille"
      source="glb local"
      intro="Fais glisser pour tourner le modèle."
    >
      <div
        ref={conteneur}
        className="scene3d"
        role="img"
        aria-label="Modèle 3D anatomique de l'oreille, manipulable"
        style={{ visibility: etat === 'pret' ? 'visible' : 'hidden' }}
      />
    </Carte>
  );
}
