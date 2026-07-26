/**
 * Canvas 3D décoratif du hero — la cochlée en rotation lente derrière le titre.
 *
 * Reprend l'idée du hero 3D de TMS (corps en rotation), avec l'oreille interne.
 * Décoratif : aucun contrôle, aria-hidden. Chargé en différé (Three.js), et
 * démonté quand le hero sort de l'écran pour ménager la batterie. La cochlée
 * reste « saine » (niveau bas) — c'est une image d'accueil, pas la démo de
 * destruction.
 */

import { useEffect, useRef } from 'react';
import { creerScene, type PoigneeScene } from './scene.js';

const REDUIT =
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HeroCanvas() {
  const conteneur = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = conteneur.current;
    if (!el) return;
    let poignee: PoigneeScene | null = null;

    const monter = () => {
      if (poignee) return;
      poignee = creerScene(el, !REDUIT);
      poignee.setNiveau(70); // cochlée saine
    };
    const demonter = () => {
      poignee?.detruire();
      poignee = null;
    };

    // Ne tourne que lorsque le hero est visible.
    const io = new IntersectionObserver(
      ([e]) => (e && e.isIntersecting ? monter() : demonter()),
      { threshold: 0.05 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      demonter();
    };
  }, []);

  return <div ref={conteneur} className="hero__gl" aria-hidden="true" />;
}
