/**
 * Coupe anatomique animée de l'oreille — SVG dessiné en code.
 *
 * Libre de droit par construction (aucun asset externe), légère, et
 * fonctionne hors-ligne comme le reste du site. Remplace le schéma en anglais
 * de la diapo 11 par une vue française, et montre le trajet du son : il entre
 * par le conduit, fait vibrer le tympan, traverse les osselets, puis excite la
 * cochlée — là où les cellules ciliées seront détruites (voir la vue 3D
 * juste après).
 *
 * Toutes les animations sont dans styles.css, sous
 * `@media (prefers-reduced-motion: no-preference)` : rien ne bouge si le
 * système demande de réduire les animations.
 */

import { Carte } from '../ui/composants.js';

export function OreilleCoupe() {
  return (
    <Carte
      titre="Le trajet du son dans l'oreille"
      source="diapo 11"
      intro="Le son entre à gauche, fait vibrer le tympan, traverse les osselets, puis atteint la cochlée — c'est là que le bruit fait ses dégâts."
    >
      <svg
        className="oreille-svg"
        viewBox="0 0 400 260"
        role="img"
        aria-label="Coupe de l'oreille : le son entre par le conduit auditif, fait vibrer le tympan, traverse les osselets et atteint la cochlée en spirale, reliée au nerf auditif."
      >
        {/* Ondes sonores entrantes */}
        <g className="oreille-ondes" fill="none" stroke="#4493f8" strokeWidth="3" strokeLinecap="round">
          <path className="onde onde1" d="M18 130 q -14 -26 0 -52" />
          <path className="onde onde2" d="M34 138 q -20 -38 0 -76" />
          <path className="onde onde3" d="M50 146 q -26 -50 0 -100" />
        </g>

        {/* Pavillon (oreille externe) */}
        <path
          d="M70 96 q -34 -6 -38 34 q -4 40 34 52 q 20 6 28 -8 l -6 -18 q -14 4 -18 -10 q -4 -16 12 -22 q 12 -4 14 -12 z"
          fill="#e8b7bd"
          stroke="#c88f97"
          strokeWidth="2"
        />

        {/* Conduit auditif */}
        <path d="M92 118 L168 128 L168 150 L92 152 Z" fill="#7a5157" opacity="0.55" />

        {/* Tympan (membrane qui vibre) */}
        <line
          className="oreille-tympan"
          x1="168"
          y1="120"
          x2="168"
          y2="158"
          stroke="#ffd479"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Osselets (marteau, enclume, étrier — stylisés) */}
        <g className="oreille-osselets" stroke="#e6edf3" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M172 132 l 14 -8" />
          <path d="M186 124 l 12 12" />
          <path d="M198 136 l 10 4" />
        </g>

        {/* Cochlée (spirale) */}
        <g transform="translate(250 138)">
          <path
            d="M0 0
               m 44 0
               a 44 44 0 1 1 -44 -44
               a 32 32 0 1 1 32 32
               a 20 20 0 1 1 -20 -20
               a 9 9 0 1 1 9 9"
            fill="none"
            stroke="#e8b7bd"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.5"
          />
          {/* Signal qui parcourt la cochlée */}
          <path
            className="oreille-signal"
            d="M0 0
               m 44 0
               a 44 44 0 1 1 -44 -44
               a 32 32 0 1 1 32 32
               a 20 20 0 1 1 -20 -20
               a 9 9 0 1 1 9 9"
            fill="none"
            stroke="#7ee787"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* Nerf auditif */}
        <path
          className="oreille-nerf"
          d="M300 150 q 40 20 78 6"
          fill="none"
          stroke="#ffd479"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Étiquettes */}
        <g className="oreille-etiq" fill="#9198a1" fontSize="11">
          <text x="44" y="204" textAnchor="middle">Pavillon</text>
          <text x="128" y="178" textAnchor="middle">Conduit</text>
          <text x="150" y="100" textAnchor="middle">Tympan</text>
          <text x="214" y="84" textAnchor="middle">Osselets</text>
          <text x="256" y="214" textAnchor="middle">Cochlée</text>
          <text x="362" y="140" textAnchor="middle">Nerf</text>
        </g>
      </svg>

      <p className="carte__intro" style={{ marginBottom: 0, marginTop: 12 }}>
        À l'intérieur de la cochlée, des <strong>cellules ciliées</strong>{' '}
        transforment ces vibrations en signal nerveux. Le bruit intense les
        couche puis les détruit — et elles <strong>ne repoussent pas</strong>.
      </p>
    </Carte>
  );
}
