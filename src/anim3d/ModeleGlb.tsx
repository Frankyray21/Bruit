/**
 * Carte « modèle 3D anatomique » — optionnelle et paramétrable.
 *
 * Dépose un fichier `.glb` dans `public/models/` (voir `LISEZMOI.md`) et cette
 * carte l'affiche dans une visionneuse qu'on tourne au doigt. Deux emplacements
 * sont prévus dans le module 4 :
 *   • `oreille.glb`  — l'oreille complète (externe + interne)
 *   • `cellules.glb` — les cellules ciliées / l'organe de Corti
 *
 * Si le fichier est absent, la carte ne s'affiche pas du tout : un travailleur
 * sous terre n'a que faire d'une consigne « dépose un fichier .glb » — elle
 * est dans public/models/LISEZMOI.md, pour qui prépare le site.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { creerVisionneuse, type VisionneuseGlb } from './sceneGlb.js';
import { Carte } from '../ui/composants.js';

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
  /** Étiquette d'accessibilité de la visionneuse. */
  readonly aria: string;
  /** Légende : une pastille de couleur par structure du modèle. */
  readonly legende?: readonly { readonly couleur: string; readonly nom: string }[];
  /** Ligne de crédit (licence du modèle), affichée sous la visionneuse. */
  readonly credit?: ReactNode;
}

export default function ModeleGlb({
  fichier,
  titre,
  intro,
  aria,
  legende,
  credit,
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

  if (etat === 'absent') return null;

  // La carte est montée dès le début mais masquée le temps du chargement : le
  // conteneur doit rester LE MÊME élément DOM, puisque la visionneuse y a
  // accroché son canvas. Une fois visible, l'observateur de redimensionnement
  // met la scène à la bonne taille.
  return (
    <Carte titre={titre} source="modèle 3D" intro={intro} cache={etat !== 'pret'}>
      <div ref={conteneur} className="scene3d" role="img" aria-label={aria} />
      {legende && (
        <ul className="legende3d" aria-label="Légende du modèle">
          {legende.map((l) => (
            <li key={l.nom}>
              <span className="legende3d__pastille" style={{ background: l.couleur }} aria-hidden="true" />
              {l.nom}
            </li>
          ))}
        </ul>
      )}
      {credit && (
        <p className="carte__source carte__source--credit" style={{ marginTop: 12 }}>
          {credit}
        </p>
      )}
    </Carte>
  );
}
