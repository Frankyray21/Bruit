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
 * curseur natif et la courbe se règlent aussi au clavier.
 */

import { useId } from 'react';
import type { NiveauVerdict } from '../domain/verdict.js';
import { entier } from './format.js';

export interface RepereX {
  readonly dBA: number;
  readonly label: string;
}

export interface GraduationY {
  readonly valeur: number;
  readonly label: string;
}

const L = 56; // marge gauche (étiquettes Y : « 200 % », « ×1000 » en 14 px)
const R = 14; // marge droite
const T = 18; // marge haute
const B = 28; // marge basse (étiquettes X)
const LARG = 360;
const HAUT = 196;
const PL = LARG - L - R; // largeur du tracé
const PH = HAUT - T - B; // hauteur du tracé

/** Conversion de l'écran au repère SVG, puis à la seule zone tracée.
 * La matrice inclut le redimensionnement, les marges CSS et les transformations.
 */
export function niveauDepuisPointeur(
  clientX: number,
  clientY: number,
  matrice: Pick<DOMMatrix, 'a' | 'b' | 'c' | 'd' | 'e' | 'f'>,
  min: number,
  max: number,
): number | null {
  const { a, b, c, d, e, f } = matrice;
  const determinant = a * d - b * c;
  if (!Number.isFinite(determinant) || determinant === 0) return null;
  const x = (d * (clientX - e) - c * (clientY - f)) / determinant;
  if (!Number.isFinite(x)) return null;
  const niveau = min + ((x - L) / PL) * (max - min);
  return Math.max(min, Math.min(max, Math.round(niveau * 10) / 10));
}

/** Les pas correspondent au curseur natif voisin : 0,1 dBA, ou 1 par page. */
export function niveauDepuisTouche(touche: string, valeur: number, min: number, max: number): number | null {
  const variations: Record<string, number> = {
    ArrowRight: 0.1, ArrowUp: 0.1, ArrowLeft: -0.1, ArrowDown: -0.1,
    PageUp: 1, PageDown: -1,
  };
  const suivant = touche === 'Home' ? min : touche === 'End' ? max
    : variations[touche] !== undefined ? valeur + variations[touche]! : null;
  return suivant === null ? null : Math.max(min, Math.min(max, Math.round(suivant * 10) / 10));
}

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

  const deplacer = (clientX: number, clientY: number, cible: SVGSVGElement) => {
    if (!onChange) return;
    const matrice = cible.getScreenCTM();
    if (!matrice) return;
    const suivant = niveauDepuisPointeur(clientX, clientY, matrice, min, max);
    if (suivant !== null && suivant !== valeur) onChange(suivant);
  };

  return (
    <svg
      className={`graphe${onChange ? ' graphe--interactif' : ''}`}
      viewBox={`0 0 ${LARG} ${HAUT}`}
      role={onChange ? 'slider' : 'img'}
      aria-label={aria}
      tabIndex={onChange ? 0 : undefined}
      aria-orientation={onChange ? 'horizontal' : undefined}
      aria-valuemin={onChange ? min : undefined}
      aria-valuemax={onChange ? max : undefined}
      aria-valuenow={onChange ? valeur : undefined}
      aria-valuetext={onChange ? `${valeur.toLocaleString('fr-CA')} dBA — ${etiquetteValeur}` : undefined}
      onKeyDown={(e) => {
        if (!onChange) return;
        const suivant = niveauDepuisTouche(e.key, valeur, min, max);
        if (suivant === null) return;
        e.preventDefault();
        if (suivant !== valeur) onChange(suivant);
      }}
      onPointerDown={(e) => {
        if (!onChange || !e.isPrimary || e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.focus({ preventScroll: true });
        deplacer(e.clientX, e.clientY, e.currentTarget);
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        deplacer(e.clientX, e.clientY, e.currentTarget);
      }}
      onPointerUp={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
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

export interface PointAnnuel {
  readonly annee: number;
  readonly valeur: number;
}

export interface MarqueAnnuelle {
  readonly annee: number;
  /** Étiquette de valeur posée sur le point ('' = point non étiqueté). */
  readonly label: string;
  /** Position de l'étiquette autour du point. */
  readonly cote: 'haut' | 'droite' | 'gauche';
  /** Un point de repli (creux) reçoit une pastille plus discrète. */
  readonly attenue?: boolean;
}

/**
 * Série temporelle annuelle — aire + ligne, une seule teinte, base zéro.
 *
 * Pour une tendance (le fardeau CNESST qui monte sur 24 ans) : la forme dit
 * l'accélération d'un coup d'œil, là où 25 barres invitent à lire chaque
 * valeur. Base zéro obligatoire (l'aire encode la magnitude par sa surface),
 * échelle linéaire (le log aplatirait la montée), tracé non lissé (aucune
 * valeur inventée entre deux années).
 */
export function SerieAnnuelle({
  points,
  yMax,
  graduationsY,
  reperesAnnees,
  marques,
  aria,
}: {
  points: readonly PointAnnuel[];
  yMax: number;
  graduationsY: readonly number[];
  reperesAnnees: readonly number[];
  marques: readonly MarqueAnnuelle[];
  aria: string;
}) {
  const id = useId().replace(/:/g, '');
  const anneeMin = points[0]!.annee;
  const anneeMax = points[points.length - 1]!.annee;

  const projX = (annee: number) =>
    L + ((annee - anneeMin) / (anneeMax - anneeMin)) * PL;
  const projY = (v: number) => T + (1 - Math.max(0, Math.min(yMax, v)) / yMax) * PH;

  const ligne = points
    .map((p, i) => `${i ? 'L' : 'M'}${projX(p.annee).toFixed(1)} ${projY(p.valeur).toFixed(1)}`)
    .join(' ');
  const aire = `${ligne} L${projX(anneeMax).toFixed(1)} ${(T + PH).toFixed(1)} L${projX(anneeMin).toFixed(1)} ${(T + PH).toFixed(1)} Z`;

  const valeurParAnnee = (a: number) => points.find((p) => p.annee === a)?.valeur ?? 0;

  return (
    <svg className="graphe" viewBox={`0 0 ${LARG} ${HAUT}`} role="img" aria-label={aria}>
      <defs>
        <linearGradient id={`aire-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--rouge-clair)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--rouge-clair)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {graduationsY.map((v) => {
        const y = projY(v);
        return (
          <g key={`y-${v}`}>
            <line className="graphe__grille" x1={L} y1={y} x2={L + PL} y2={y} />
            <text className="graphe__gradY" x={L - 8} y={y} dominantBaseline="middle" textAnchor="end">
              {v === 0 ? '0' : `${entier(v / 1000)} k`}
            </text>
          </g>
        );
      })}

      {reperesAnnees.map((a) => (
        <text
          key={`x-${a}`}
          className="graphe__gradX"
          x={projX(a)}
          y={HAUT - 8}
          textAnchor={a === anneeMin ? 'start' : a === anneeMax ? 'end' : 'middle'}
        >
          {a}
        </text>
      ))}

      <path d={aire} fill={`url(#aire-${id})`} />
      <path className="graphe__ligne" d={ligne} />

      {marques.map((m) => {
        const x = projX(m.annee);
        const y = projY(valeurParAnnee(m.annee));
        const lx = m.cote === 'droite' ? x + 10 : m.cote === 'gauche' ? x - 10 : x;
        const ly = m.cote === 'haut' ? y - 12 : y + 4;
        const ancre = m.cote === 'droite' ? 'start' : m.cote === 'gauche' ? 'end' : 'middle';
        return (
          <g key={`m-${m.annee}`}>
            <circle className="graphe__halo" cx={x} cy={y} r={m.attenue ? 6 : 7.5} />
            <circle
              className="graphe__point graphe__point--rouge"
              cx={x}
              cy={y}
              r={m.attenue ? 4 : 5.5}
              opacity={m.attenue ? 0.7 : 1}
            />
            {m.label && (
              <text className="graphe__valeur" x={lx} y={ly} textAnchor={ancre}>
                {m.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export interface SommetDose {
  /** Heures de quart écoulées. */
  readonly h: number;
  /** Dose cumulée en % (100 = limite réglementaire). */
  readonly dose: number;
}

/**
 * Échelle verticale de l'horloge de dose : elle s'adapte à la dose réelle du
 * quart pour montrer la courbe au complet, avec des graduations rondes (au
 * plus cinq). Une dose de 347 % s'affiche sur 0-400 %, une dose de 100 000 %
 * (jackleg, 8 h) sur 0-125 000 % — et la ligne des 100 % se retrouve alors
 * collée à l'axe : c'est exactement ce que le chiffre veut dire.
 */
export function echelleDose(doseTotale: number): { max: number; pas: number } {
  const cible = Math.max(100, doseTotale);
  const pas =
    [25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000, 100000].find(
      (p) => cible / p <= 5,
    ) ?? 100000;
  return { max: Math.max(pas, Math.ceil(cible / pas) * pas), pas };
}

/**
 * Horloge de dose — dose cumulée d'un quart en fonction des heures écoulées.
 *
 * Honnête par construction : axe X en HEURES ÉCOULÉES (pas en heure murale — la
 * pile de tâches n'est pas horodatée) ; échelle Y adaptée à la dose réelle,
 * pour que la courbe soit toujours entière ; le franchissement des 100 % est
 * marqué ; la courbe cumulée ne redescend jamais.
 */
export function HorlogeDose({
  sommets,
  momentLimite,
  momentLabel,
  doseTotale,
  aria,
}: {
  sommets: readonly SommetDose[];
  /** Heures écoulées au franchissement des 100 %, ou null. */
  momentLimite: number | null;
  /** Étiquette du franchissement (ex. « 48 min »). */
  momentLabel: string;
  doseTotale: number;
  aria: string;
}) {
  const id = useId().replace(/:/g, '');
  const heures = sommets.length ? sommets[sommets.length - 1]!.h : 8;
  const xMax = Math.max(8, Math.min(12, Math.ceil(heures)));
  const sommetMax = sommets.reduce((m, s) => Math.max(m, s.dose), doseTotale);
  const { max: yMax, pas } = echelleDose(sommetMax);

  const projX = (h: number) => L + (Math.min(h, xMax) / xMax) * PL;
  const projY = (d: number) => T + (1 - Math.min(d, yMax) / yMax) * PH;

  const ligne = sommets
    .map((s, i) => `${i ? 'L' : 'M'}${projX(s.h).toFixed(1)} ${projY(s.dose).toFixed(1)}`)
    .join(' ');
  const aire = `${ligne} L${projX(heures).toFixed(1)} ${(T + PH).toFixed(1)} L${projX(0).toFixed(1)} ${(T + PH).toFixed(1)} Z`;

  const y100 = projY(100);
  const gradY: number[] = [];
  for (let v = 0; v <= yMax; v += pas) gradY.push(v);
  const ticksX = [];
  for (let h = 0; h <= xMax; h += 2) ticksX.push(h);

  return (
    <svg className="graphe" viewBox={`0 0 ${LARG} ${HAUT}`} role="img" aria-label={aria}>
      <defs>
        <linearGradient id={`aire-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--rouge-clair)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--rouge-clair)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {gradY.map((v) => {
        const y = projY(v);
        return (
          <g key={`y-${v}`}>
            <line className="graphe__grille" x1={L} y1={y} x2={L + PL} y2={y} />
            <text className="graphe__gradY" x={L - 8} y={y} dominantBaseline="middle" textAnchor="end">
              {v === 0 ? '0' : `${entier(v)} %`}
            </text>
          </g>
        );
      })}

      {ticksX.map((h) => (
        <text
          key={`x-${h}`}
          className="graphe__gradX"
          x={projX(h)}
          y={HAUT - 8}
          textAnchor={h === 0 ? 'start' : h === xMax ? 'end' : 'middle'}
        >
          {h} h
        </text>
      ))}

      <path d={aire} fill={`url(#aire-${id})`} />
      <path className="graphe__ligne" d={ligne} />

      {/* Ligne de limite du quart (100 %), étiquetée à droite pour ne pas
          heurter le point de franchissement (toujours à gauche). */}
      <line className="graphe__seuil" x1={L} y1={y100} x2={L + PL} y2={y100} />
      <text className="graphe__seuil-lbl" x={L + PL} y={y100 - 6} textAnchor="end">
        limite du quart · 100 %
      </text>

      {/* Franchissement des 100 % */}
      {momentLimite !== null && momentLimite <= xMax && (
        <g>
          <circle className="graphe__halo" cx={projX(momentLimite)} cy={y100} r="8" />
          <circle className="graphe__point graphe__point--rouge" cx={projX(momentLimite)} cy={y100} r="5.5" />
          {/* L'étiquette passe au-dessus quand la ligne des 100 % touche le bas. */}
          <text
            className="graphe__valeur"
            x={projX(momentLimite) + 10}
            y={y100 > T + PH - 24 ? y100 - 10 : y100 + 20}
            textAnchor="start"
          >
            {momentLabel}
          </text>
        </g>
      )}

      {/* Dose finale, posée près du dernier sommet. */}
      {sommets.length > 1 && (
        <text
          className="graphe__hors"
          x={projX(heures) - 6}
          y={Math.max(T + 12, projY(sommets[sommets.length - 1]!.dose) - 8)}
          textAnchor="end"
        >
          {entier(doseTotale)} % en fin de quart
        </text>
      )}
    </svg>
  );
}
