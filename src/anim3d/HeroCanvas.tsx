/**
 * Canvas 3D du hero — un vrai modèle GLB d'oreille en rotation lente.
 *
 * Comme le hero de TMS charge un vrai modèle de corps (et non une forme générée
 * par code), le hero de Bruit charge un vrai modèle d'oreille déposé dans
 * `public/models/oreille.glb`. S'il est absent, le composant ne rend rien : le
 * fond propre (ondes sonores + dégradé) de HeroOreille reste visible.
 *
 * Décoratif (aria-hidden), rotation lente, démonté hors écran.
 */

import { useEffect, useRef, useState } from 'react';
import { creerVisionneuse, type VisionneuseGlb } from './sceneGlb.js';

const URL_MODELE = `${import.meta.env.BASE_URL}models/oreille.glb`;

const REDUIT =
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HeroCanvas() {
  const conteneur = useRef<HTMLDivElement>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const el = conteneur.current;
    if (!el) return;
    let visionneuse: VisionneuseGlb | null = null;
    let annule = false;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e && e.isIntersecting && !visionneuse) {
          creerVisionneuse(el, URL_MODELE, !REDUIT)
            .then((v) => {
              if (annule) {
                v.detruire();
                return;
              }
              visionneuse = v;
              setPret(true);
            })
            .catch(() => setPret(false)); // pas de modèle : le fond reste visible
        } else if ((!e || !e.isIntersecting) && visionneuse) {
          visionneuse.detruire();
          visionneuse = null;
        }
      },
      { threshold: 0.05 },
    );
    io.observe(el);

    return () => {
      annule = true;
      io.disconnect();
      visionneuse?.detruire();
    };
  }, []);

  return (
    <div
      ref={conteneur}
      className="hero__gl"
      aria-hidden="true"
      style={{ opacity: pret ? 1 : 0 }}
    />
  );
}
