/**
 * Canvas 3D du hero.
 *
 * Préfère un VRAI modèle d'oreille si tu en déposes un
 * (`public/models/oreille.glb`) — comme le hero de TMS. Sinon, il montre une
 * cochlée nacrée générée en code, propre et reconnaissable.
 *
 * Décoratif (aria-hidden), chargé en différé, démonté hors écran, pose fixe si
 * prefers-reduced-motion.
 */

import { useEffect, useRef, useState } from 'react';
import { creerHeroCochlee, type PoigneeHero } from './heroCochlee.js';
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
    let procedural: PoigneeHero | null = null;
    let modele: VisionneuseGlb | null = null;
    let annule = false;

    const monter = () => {
      if (procedural || modele) return;
      // On tente d'abord le vrai modèle ; s'il n'existe pas, la cochlée générée.
      creerVisionneuse(el, URL_MODELE, !REDUIT)
        .then((v) => {
          if (annule) return v.detruire();
          modele = v;
          setPret(true);
        })
        .catch(() => {
          if (annule) return;
          procedural = creerHeroCochlee(el, !REDUIT);
          setPret(true);
        });
    };
    const demonter = () => {
      procedural?.detruire();
      modele?.detruire();
      procedural = null;
      modele = null;
    };

    const io = new IntersectionObserver(
      ([e]) => (e && e.isIntersecting ? monter() : demonter()),
      { threshold: 0.05 },
    );
    io.observe(el);

    return () => {
      annule = true;
      io.disconnect();
      demonter();
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
