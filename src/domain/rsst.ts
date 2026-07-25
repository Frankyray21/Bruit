/**
 * Durée permise, dose et niveau équivalent — RSST article 137.
 *
 * Voir docs/modele-de-calcul.md §1 et §2. Chaque constante de ce fichier est
 * traçable à une diapo de la formation ; ne rien y ajouter sans référence.
 */

/** Niveau de référence de la norme québécoise (diapo 5). */
export const NIVEAU_REFERENCE_DBA = 85;

/** Durée de référence associée (diapo 5). */
export const DUREE_REFERENCE_H = 8;

/**
 * Facteur de bissection : « à chaque 3 dBA, l'impact est doublé » (diapo 4).
 * C'est la clé de voûte de tout le domaine.
 */
export const FACTEUR_BISSECTION_DB = 3;

/**
 * Coefficient du niveau équivalent. Vaut 3/log₁₀2 = 9,9658 et NON 10 :
 * l'approximation casse l'aller-retour dose → niveau, d'autant plus que le
 * niveau est élevé (115,003 au lieu de 114,900 pour le jackleg).
 */
export const COEFFICIENT_LEX = FACTEUR_BISSECTION_DB / Math.log10(2);

/**
 * Table réglementaire de la diapo 6. Le règlement arrondit 12,70 h à 12 h à
 * 83 dBA, à l'avantage du travailleur : pour les niveaux qui y figurent, la
 * table prime sur la formule.
 */
export const TABLE_RSST: ReadonlyMap<number, number> = new Map([
  [82, 16],
  [83, 12],
  [85, 8],
  [88, 4],
  [91, 2],
  [94, 1],
]);

/**
 * Durée maximale d'exposition permise, en heures, pour un niveau continu
 * équivalent donné. Extrapole au-delà de la table — c'est nécessaire, le
 * terrain dépasse largement les 94 dBA de la dernière ligne.
 */
export function dureePermise(niveauDBA: number): number {
  const valeurTable = TABLE_RSST.get(niveauDBA);
  if (valeurTable !== undefined) return valeurTable;

  return (
    DUREE_REFERENCE_H /
    2 ** ((niveauDBA - NIVEAU_REFERENCE_DBA) / FACTEUR_BISSECTION_DB)
  );
}

/** Une tâche du quart : un niveau tenu pendant une durée. */
export interface Tache {
  readonly nom?: string;
  readonly niveauDBA: number;
  readonly dureeH: number;
}

/**
 * Dose de bruit en pourcentage. 100 % = la limite réglementaire du quart.
 *
 * Les tâches silencieuses ne « compensent » rien : elles ajoutent simplement
 * très peu. Deux heures à 66 dBA pèsent 0,3 % de la dose.
 */
export function dose(taches: readonly Tache[]): number {
  return taches.reduce(
    (total, t) => total + (100 * t.dureeH) / dureePermise(t.niveauDBA),
    0,
  );
}

/** Niveau continu équivalent sur 8 h correspondant à une dose donnée. */
export function niveauEquivalent8h(dosePourcent: number): number {
  if (dosePourcent <= 0) return Number.NEGATIVE_INFINITY;
  return NIVEAU_REFERENCE_DBA + COEFFICIENT_LEX * Math.log10(dosePourcent / 100);
}

/**
 * Moment où la dose atteint 100 %, exprimé en heures écoulées depuis le début
 * du quart. `null` si la limite n'est jamais atteinte.
 *
 * Les tâches sont consommées dans l'ordre fourni : c'est ce qui permet de dire
 * « ta journée est finie à 7 h 48 », et pas seulement « tu es à 397 % ».
 */
export function momentLimiteAtteinte(taches: readonly Tache[]): number | null {
  let doseCumulee = 0;
  let heuresEcoulees = 0;

  for (const tache of taches) {
    const doseParHeure = 100 / dureePermise(tache.niveauDBA);
    const dosePleine = doseParHeure * tache.dureeH;

    if (doseCumulee + dosePleine >= 100) {
      return heuresEcoulees + (100 - doseCumulee) / doseParHeure;
    }

    doseCumulee += dosePleine;
    heuresEcoulees += tache.dureeH;
  }

  return null;
}

/**
 * Met une durée en forme pour un travailleur.
 *
 * Sous la minute, on bascule en secondes : le mineur au jackleg a droit à
 * 0,008 h, ce qui ne veut rien dire, alors que « 29 secondes » se retient pour
 * la vie.
 */
export function formaterDuree(heures: number): string {
  const totalSecondes = Math.round(heures * 3600);

  if (totalSecondes < 60) return `${totalSecondes} s`;

  const h = Math.floor(totalSecondes / 3600);
  const min = Math.round((totalSecondes - h * 3600) / 60);

  if (h === 0) return `${min} min`;
  return `${h} h ${String(min).padStart(2, '0')}`;
}
