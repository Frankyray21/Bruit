/**
 * Cumul d'exposition sur une carrière.
 *
 * Voir docs/modele-de-calcul.md §8.
 *
 * Aucune science ajoutée : c'est le compteur du règlement, prolongé dans le
 * temps. Ce module ne prédit PAS de perte auditive — projeter des décibels
 * perdus exigerait la norme ISO 1999 et ses coefficients tabulés par fréquence,
 * qui ne doivent pas être improvisés.
 */

import { dose, type Tache } from './rsst.js';

/** Jours travaillés par an, valeur par défaut usuelle en mine. */
export const JOURS_PAR_AN_DEFAUT = 240;

export interface CumulCarriere {
  /** Doses réglementaires consommées en une journée. 1 = la limite. */
  readonly dosesParJour: number;
  readonly dosesParAn: number;
  readonly dosesTotales: number;
}

export function cumulCarriere(
  taches: readonly Tache[],
  annees: number,
  joursParAn = JOURS_PAR_AN_DEFAUT,
): CumulCarriere {
  const dosesParJour = dose(taches) / 100;
  const dosesParAn = dosesParJour * joursParAn;

  return { dosesParJour, dosesParAn, dosesTotales: dosesParAn * annees };
}
