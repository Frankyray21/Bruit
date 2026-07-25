/**
 * Verdict lisible en trois secondes, avec des gants, sous une lampe frontale.
 *
 * ⚠️ Seul le seuil de 105 dBA vient de la formation (diapo 14). Les paliers de
 * dose à 50 % et 100 % sont une convention de ce projet, pas une règle du RSST.
 */

import { dureePermise } from './rsst.js';
import {
  attenuationDoubleProtection,
  attenuationReelle,
  doubleProtectionRecommandee,
} from './protection.js';

export type NiveauVerdict = 'vert' | 'jaune' | 'rouge' | 'critique';

export interface Verdict {
  readonly niveau: NiveauVerdict;
  readonly message: string;
}

export function verdictDose(dosePourcent: number): Verdict {
  if (dosePourcent > 100)
    return { niveau: 'rouge', message: 'Limite dépassée — protection obligatoire' };
  if (dosePourcent >= 50)
    return { niveau: 'jaune', message: 'Attention, dose élevée' };
  return { niveau: 'vert', message: 'Sous la limite' };
}

/**
 * L'équipement de protection suffit-il à couvrir un quart complet ?
 *
 * Sur les 13 métiers mesurés, un seul répond non : le mineur au jackleg à
 * 114,9 dBA, qui reste hors norme même en double protection avec le meilleur
 * bouchon (2 h 28 permises). C'est une conclusion que les chiffres de la mine
 * imposent, mais qui déborde du message « choisis, pose, porte » de la
 * formation — à porter au comité SST avant de l'afficher.
 */
export function protectionSuffisante(
  niveauDBA: number,
  nrrBouchons: number,
  nrrCoquilles: number,
  facteur: number,
  dureeQuartH = 8,
): Verdict {
  const avecSimple = niveauDBA - attenuationReelle(nrrBouchons, facteur);
  if (dureePermise(avecSimple) >= dureeQuartH)
    return { niveau: 'vert', message: 'Protection simple suffisante' };

  const avecDouble =
    niveauDBA - attenuationDoubleProtection(nrrBouchons, nrrCoquilles, facteur);
  if (dureePermise(avecDouble) >= dureeQuartH)
    return { niveau: 'jaune', message: 'Double protection requise' };

  return {
    niveau: 'critique',
    message:
      "La protection ne suffit pas pour un quart complet — le temps d'exposition doit être limité",
  };
}

export { doubleProtectionRecommandee };
