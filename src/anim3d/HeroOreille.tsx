/**
 * Hero d'accueil — fond sobre (ondes sonores) + titre.
 *
 * Aucun objet 3D ici : l'accueil doit s'ouvrir vite, même sur un vieux
 * téléphone, et ne pas charger Three.js avant qu'on en ait besoin (module 4).
 * Le motif d'ondes concentriques est dessiné en SVG, donc léger et hors-ligne.
 * `coin` permet de poser un élément en haut à droite (ex. : le code QR en
 * projection).
 */

import type { ReactNode } from 'react';

export function HeroOreille({ children, coin }: { children: ReactNode; coin?: ReactNode }) {
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
        <div className="hero__voile" />
      </div>
      {coin && <div className="hero__coin">{coin}</div>}
      <div className="hero__contenu">{children}</div>
    </section>
  );
}
