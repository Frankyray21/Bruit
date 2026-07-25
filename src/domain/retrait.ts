/**
 * Budget de retrait — inversion analytique du calcul de temps de port.
 *
 * Voir docs/modele-de-calcul.md §6.
 *
 * Le curseur de temps de port fait naître une question à laquelle il ne répond
 * pas : « alors, combien de temps ai-je le droit de les enlever ? » Ce module y
 * répond par un nombre de minutes, ce qui transforme le slogan « porter en tout
 * temps » en budget vérifiable par le travailleur lui-même.
 */

import { NIVEAU_REFERENCE_DBA } from './rsst.js';

export interface BudgetRetrait {
  /** Fraction minimale du quart avec protection, de 0 à 1. */
  readonly tempsDePortMinimal: number;
  /** Minutes de retrait tolérées sur le quart. */
  readonly minutesDeRetrait: number;
  /**
   * `false` quand aucun temps de port ne suffit : le protecteur est inadéquat
   * pour ce poste, même porté en permanence.
   */
  readonly realisable: boolean;
}

/**
 * Combien de temps ce protecteur peut-il être retiré sans dépasser 85 dBA ?
 *
 * @param niveauDBA niveau du poste, sans protection
 * @param attenuationNominale atténuation dératée du protecteur
 * @param dureeQuartH durée du quart, en heures
 */
export function budgetRetrait(
  niveauDBA: number,
  attenuationNominale: number,
  dureeQuartH = 8,
): BudgetRetrait {
  const attenuationRequise = niveauDBA - NIVEAU_REFERENCE_DBA;

  // Poste déjà sous la norme : aucune contrainte de port.
  if (attenuationRequise <= 0) {
    return {
      tempsDePortMinimal: 0,
      minutesDeRetrait: dureeQuartH * 60,
      realisable: true,
    };
  }

  const numerateur = 1 - 10 ** (-attenuationRequise / 10);
  const denominateur = 1 - 10 ** (-attenuationNominale / 10);
  const tempsDePortMinimal = numerateur / denominateur;

  if (tempsDePortMinimal > 1) {
    return { tempsDePortMinimal, minutesDeRetrait: 0, realisable: false };
  }

  return {
    tempsDePortMinimal,
    minutesDeRetrait: (1 - tempsDePortMinimal) * dureeQuartH * 60,
    realisable: true,
  };
}
