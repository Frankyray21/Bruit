/**
 * Hero d'accueil — fond propre (ondes sonores) + titre, et, si un vrai modèle
 * GLB d'oreille est déposé, ce modèle en 3D par-dessus.
 *
 * Par défaut, aucun objet 3D généré par code : un motif d'ondes sonores sobre
 * sert de fond. Dès qu'un fichier `public/models/oreille.glb` est présent, la
 * 3D réelle apparaît en fondu — exactement l'idée du hero de TMS.
 */

import { lazy, Suspense, type ReactNode } from 'react';

const HeroCanvas = lazy(() => import('./HeroCanvas.js'));

export function HeroOreille({ children }: { children: ReactNode }) {
  return (
    <section className="hero">
      <div className="hero__media">
        {/* Fond sobre : ondes sonores concentriques, motif de marque. */}
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

        {/* Vrai modèle 3D si présent ; sinon, ne rend rien. */}
        <Suspense fallback={null}>
          <HeroCanvas />
        </Suspense>

        <div className="hero__voile" />
      </div>
      <div className="hero__contenu">{children}</div>
    </section>
  );
}
