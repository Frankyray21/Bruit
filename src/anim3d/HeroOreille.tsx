/**
 * Hero d'accueil — le modèle 3D de l'oreille en fond, titre par-dessus.
 *
 * Trois fonds possibles, du meilleur au plus modeste :
 *   1. le modèle Sketchfab annoté, qui tourne tout seul (demande le réseau) ;
 *   2. un `public/models/oreille.glb` déposé dans le dépôt, ou la cochlée
 *      générée en code — les deux fonctionnent hors-ligne (voir HeroCanvas) ;
 *   3. le motif d'ondes sonores, toujours dessiné derrière.
 *
 * Le repli n'est pas un détail : au fond de la mine il n'y a pas de réseau, et
 * c'est justement là que le site doit encore s'ouvrir.
 */

import { lazy, Suspense, type ReactNode } from 'react';
import {
  CreditSketchfab,
  SKETCHFAB_ATTRIBUTS,
  SKETCHFAB_SRC,
  useSketchfab,
} from './sketchfab.js';

const HeroCanvas = lazy(() => import('./HeroCanvas.js'));

export function HeroOreille({ children }: { children: ReactNode }) {
  const sketchfab = useSketchfab();

  return (
    <section className="hero">
      <div className="hero__media">
        {/* Fond sobre : ondes sonores concentriques, motif de marque. Il reste
            derrière le modèle : c'est ce qu'on voit pendant son chargement. */}
        <svg
          className="hero__ondes"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="hero-lueur" cx="72%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#d22325" stopOpacity="0.28" />
              <stop offset="55%" stopColor="#d22325" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#d22325" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill="url(#hero-lueur)" />
          <g
            fill="none"
            stroke="#ef5a5c"
            strokeLinecap="round"
            transform="translate(288 132)"
          >
            <path className="hero__onde ho1" d="M0 -34 A34 34 0 0 1 0 34" strokeWidth="3" opacity="0.9" />
            <path className="hero__onde ho2" d="M0 -60 A60 60 0 0 1 0 60" strokeWidth="2.4" opacity="0.6" />
            <path className="hero__onde ho3" d="M0 -88 A88 88 0 0 1 0 88" strokeWidth="2" opacity="0.4" />
            <path className="hero__onde ho4" d="M0 -118 A118 118 0 0 1 0 118" strokeWidth="1.6" opacity="0.25" />
          </g>
          <circle cx="288" cy="132" r="6" fill="#ef5a5c" />
        </svg>

        {sketchfab === 'joignable' ? (
          <iframe
            className="hero__sketchfab"
            title="Coupe de l'oreille en 3D"
            src={SKETCHFAB_SRC}
            allowFullScreen
            allow="autoplay; fullscreen; xr-spatial-tracking"
            {...SKETCHFAB_ATTRIBUTS}
          />
        ) : (
          /* Pas de réseau : le modèle local (ou la cochlée générée en code). */
          sketchfab === 'indisponible' && (
            <Suspense fallback={null}>
              <HeroCanvas />
            </Suspense>
          )
        )}

        <div
          className={`hero__voile${sketchfab === 'joignable' ? ' hero__voile--modele' : ''}`}
        />
      </div>

      <div className="hero__contenu">{children}</div>

      {sketchfab === 'joignable' && <CreditSketchfab className="hero__credit" />}
    </section>
  );
}
