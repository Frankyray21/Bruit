/**
 * Graphique « niveau de bruit → grandeur », en SVG pur.
 *
 * Un seul composant sert les deux histoires miroir du module 2 : la durée
 * permise qui s'effondre, et l'énergie reçue qui explose — même axe des dBA,
 * sens inverse. Tout est dessiné en SVG : net à toute taille, hors-ligne,
 * thématisable (thème sombre du site).
 *
 * On peut aussi glisser le doigt sur la courbe pour déplacer le niveau : c'est
 * une deuxième surface de contrôle, large et utilisable avec des gants. Le
 * curseur natif reste le contrôle accessible au clavier ; la courbe l'appuie.
 */

import { useId } from 'react';
import type { NiveauVerdict } from '../domain/verdict.js';

export interface RepereX {
  readonly dBA: number;
  readonly label: string;
}

export interface GraduationY {
  readonly valeur: number;
  readonly label: string;
}

const L = 44; // marge gauche (étiquettes Y)
const R = 14; // marge droite
const T = 16; // marge haute
const B = 26; // marge basse (étiquettes X)
const LARG = 360;
const HAUT = 196;
const PL = LARG - L - R; // largeur du tracé
const PH = HAUT - T - B; // hauteur du tracé

const CLASSE_TON: Record<NiveauVerdict, string> = {
  vert: 'graphe__point--vert',
  jaune: 'graphe__point--jaune',
  rouge: 'graphe__point--rouge',
  critique: 'graphe__point--rouge',
};

export function CourbeNiveau({
  min,
  max,
  valeur,
  f,
  echelleY = 'lineaire',
  reperesX,
  graduationsY,
  etiquetteValeur,
  ton,
  aria,
  onChange,
}: {
  min: number;
  max: number;
  valeur: number;
  /** Grandeur tracée en fonction du niveau (dBA). */
  f: (dBA: number) => number;
  echelleY?: 'lineaire' | 'log';
  reperesX: readonly RepereX[];
  graduationsY: readonly GraduationY[];
  /** Étiquette directe posée sur le point courant (ex. « 25 min »). */
  etiquetteValeur: string;
  ton: NiveauVerdict;
  aria: string;
  onChange?: (dBA: number) => void;
}) {
  const id = useId().replace(/:/g, '');
  const valeursY = graduationsY.map((g) => g.valeur);
  const yMin = Math.min(...valeursY);
  const yMax = Math.max(...valeursY);

  const projX = (dBA: number) => L + ((dBA - min) / (max - min)) * PL;

  const projY = (v: number) => {
    const borne = Math.max(yMin, Math.min(yMax, v));
    const frac =
      echelleY === 'log'
        ? (Math.log(borne) - Math.log(yMin)) / (Math.log(yMax) - Math.log(yMin))
        : (borne - yMin) / (yMax - yMin);
    return T + (1 - frac) * PH;
  };

  // Échantillonnage de la courbe.
  const N = 72;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= N; i++) {
    const dBA = min + ((max - min) * i) / N;
    pts.push([projX(dBA), projY(f(dBA))]);
  }
  const ligne = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const aire = `${ligne} L${projX(max).toFixed(1)} ${(T + PH).toFixed(1)} L${projX(min).toFixed(1)} ${(T + PH).toFixed(1)} Z`;

  const px = projX(valeur);
  const py = projY(f(valeur));
  const labelDroite = px > L + PL * 0.62;
  // Près du haut du cadre, l'étiquette passe SOUS le point pour ne pas être
  // rognée par le bord ; sinon au-dessus.
  const hautProche = py < T + 26;
  const labelY = hautProche ? py + 22 : py - 12;

  const deplacer = (clientX: number, cible: SVGSVGElement) => {
    if (!onChange) return;
    const rect = cible.getBoundingClientRect();
    const frac = (clientX - rect.left) / rect.width;
    const dBA = min + frac * (max - min);
    const borne = Math.max(min, Math.min(max, dBA));
    onChange(Math.round(borne * 10) / 10);
  };

  return (
    <svg
      className={`graphe${onChange ? ' graphe--interactif' : ''}`}
      viewBox={`0 0 ${LARG} ${HAUT}`}
      role="img"
      aria-label={aria}
      onPointerDown={(e) => {
        if (!onChange) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        deplacer(e.clientX, e.currentTarget);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 0) return;
        deplacer(e.clientX, e.currentTarget);
      }}
    >
      <defs>
        <linearGradient id={`aire-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--rouge-clair)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--rouge-clair)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grille + étiquettes Y */}
      {graduationsY.map((g) => {
        const y = projY(g.valeur);
        return (
          <g key={`y-${g.valeur}`}>
            <line className="graphe__grille" x1={L} y1={y} x2={L + PL} y2={y} />
            <text className="graphe__gradY" x={L - 8} y={y} dominantBaseline="middle" textAnchor="end">
              {g.label}
            </text>
          </g>
        );
      })}

      {/* Étiquettes X */}
      {reperesX.map((r) => (
        <text
          key={`x-${r.dBA}`}
          className="graphe__gradX"
          x={projX(r.dBA)}
          y={HAUT - 8}
          textAnchor="middle"
        >
          {r.label}
        </text>
      ))}

      {/* Aire + courbe */}
      <path d={aire} fill={`url(#aire-${id})`} />
      <path className="graphe__ligne" d={ligne} />

      {/* Ligne de rappel verticale sous le point courant */}
      <line className="graphe__rappel" x1={px} y1={py} x2={px} y2={T + PH} />

      {/* Point courant : anneau de surface + pastille colorée par le verdict */}
      <circle className="graphe__halo" cx={px} cy={py} r="8" />
      <circle className={`graphe__point ${CLASSE_TON[ton]}`} cx={px} cy={py} r="5.5" />

      {/* Étiquette directe du point */}
      <text
        className="graphe__valeur"
        x={labelDroite ? px - 12 : px + 12}
        y={labelY}
        textAnchor={labelDroite ? 'end' : 'start'}
      >
        {etiquetteValeur}
      </text>
    </svg>
  );
}
