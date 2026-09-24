/**
 * Tonotopie et vulnérabilité au bruit — le modèle scientifique de la scène
 * « La cochlée sous le bruit ». Fonctions pures, testées.
 *
 * Références :
 * - Greenwood (1990), J. Acoust. Soc. Am. 87 : f = A·(10^(a·x) − k), avec
 *   A = 165,4 Hz, a = 2,1 et k = 0,88 pour l'humain, x = fraction de la longueur
 *   de la membrane basilaire comptée depuis l'apex (0 = apex, 1 = base).
 *   Longueur ≈ 33–35 mm ; 2,5 tours.
 * - Surdité professionnelle : perte qui commence par une encoche à 3–6 kHz
 *   (centrée sur 4 kHz), puis s'étend aux fréquences voisines avec l'exposition
 *   (ISO 1999 ; NIOSH 1998).
 * - Histopathologie : les cellules ciliées externes (CCE) sont atteintes avant
 *   les internes (CCI), et la première rangée de CCE avant les deux autres ;
 *   stéréocils désorganisés puis fusionnés, puis mort cellulaire et cicatrice
 *   des cellules de soutien (Bohne & Harding 2000 ; Liberman & Dodds 1984).
 *
 * L'intensité du dommage en fonction du niveau reste schématique : elle rend
 * visible l'ordre et la localisation, pas une dose réelle (qui dépend de la
 * durée, voir le calcul de dose de la boîte à outils).
 */

/** Longueur de la membrane basilaire humaine, en millimètres (ordre de grandeur). */
export const LONGUEUR_MEMBRANE_MM = 34;

const A = 165.4;
const a = 2.1;
const k = 0.88;

/** Fréquence codée (Hz) à la fraction `xApex` de la membrane depuis l'apex. */
export function frequenceGreenwood(xApex: number): number {
  return A * (10 ** (a * xApex) - k);
}

/** Position (fraction depuis l'apex) qui code la fréquence `f` (Hz). */
export function positionGreenwood(f: number): number {
  return Math.log10(f / A + k) / a;
}

/** Contrainte schématique : rien sous 80 dBA, saturation vers 120 dBA. */
export function contrainte(niveauDBA: number): number {
  return Math.min(1, Math.max(0, (niveauDBA - 80) / 40));
}

/**
 * Vulnérabilité d'une région selon sa fréquence, 0 à 1.
 *
 * Bosse log-normale centrée sur 4 kHz (largeur ≈ ±1 octave, l'encoche
 * 3–6 kHz), qui s'élargit quand la contrainte monte (extension aux fréquences
 * voisines), sur un socle qui favorise les aigus.
 */
export function vulnerabilite(f: number, stress: number): number {
  const octaves = Math.log2(Math.max(f, 1) / 4000);
  const largeur = 0.8 + 1.4 * stress;
  const bosse = Math.exp(-(octaves ** 2) / (2 * largeur ** 2));
  const socle = 0.15 + 0.15 * Math.min(1, Math.max(0, Math.log10(Math.max(f, 1) / 100) / 2.3));
  return Math.min(1, socle + 0.85 * bosse);
}

/**
 * Dommage d'une cellule ciliée externe, 0 (saine) à 1 (détruite).
 * @param sBase fraction depuis la base (0 = base, 1 = apex)
 * @param rangee 0 = première rangée (la plus vulnérable), 1, 2
 */
export function dommageCce(sBase: number, niveauDBA: number, rangee = 0): number {
  const stress = contrainte(niveauDBA);
  const f = frequenceGreenwood(1 - sBase);
  const facteurRangee = [1, 0.85, 0.72][rangee] ?? 0.72;
  return Math.min(1, stress * (0.25 + 1.05 * vulnerabilite(f, stress)) * facteurRangee);
}

/** Dommage d'une cellule ciliée interne : plus tardif et moindre que celui des CCE. */
export function dommageCci(sBase: number, niveauDBA: number): number {
  const d = dommageCce(sBase, niveauDBA, 0);
  return Math.min(1, 0.75 * d * d);
}
