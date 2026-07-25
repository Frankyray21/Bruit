/**
 * Protecteurs auditifs : atténuation réelle, double protection, temps de port.
 *
 * Voir docs/modele-de-calcul.md §3, §4 et §5.
 */

export type TypeProtecteur = 'bouchons' | 'coquilles';

/**
 * Facteurs de dérating.
 *
 * La formation se contredit : la diapo 13 annonce 70 % pour les bouchons, mais
 * l'exemple chiffré de la diapo 14 calcule avec 60 % (32 × 0,60 = 19 dBA). On
 * retient 60 % — le plus conservateur, et celui qui reproduit l'exemple
 * enseigné — mais le facteur reste configurable : il fait passer le jackleg en
 * double protection de 2 h 28 à 5 h 17.
 */
export const FACTEURS_DERATING_DEFAUT: Readonly<Record<TypeProtecteur, number>> =
  {
    bouchons: 0.6,
    coquilles: 0.75,
  };

/** Seuil au-delà duquel la double protection est recommandée (diapo 14). */
export const SEUIL_DOUBLE_PROTECTION_DBA = 105;

/** Gain apporté par le second dispositif (diapo 14). */
export const BONUS_DOUBLE_PROTECTION_DB = 5;

/**
 * Atténuation réellement obtenue sur le terrain, à partir du NRR de laboratoire.
 */
export function attenuationReelle(nrr: number, facteur: number): number {
  return nrr * facteur;
}

/**
 * Atténuation de la double protection.
 *
 * Les atténuations ne s'additionnent pas : bouchons NRR 32 + coquilles NRR 25
 * ne donnent pas 57 dB mais environ 24. On part du meilleur des deux NRR et on
 * ajoute 5 dB.
 */
export function attenuationDoubleProtection(
  nrrBouchons: number,
  nrrCoquilles: number,
  facteur: number,
): number {
  return (
    attenuationReelle(Math.max(nrrBouchons, nrrCoquilles), facteur) +
    BONUS_DOUBLE_PROTECTION_DB
  );
}

/**
 * Atténuation effective compte tenu du temps de port réel.
 *
 * C'est le calcul le plus contre-intuitif du domaine : l'énergie reçue pendant
 * les périodes sans protection domine complètement le bilan du quart. Retirer
 * ses bouchons 10 minutes sur 8 h fait tomber une protection de 30 dB à 17 dB.
 *
 * @param attenuationNominale atténuation quand le protecteur est porté
 * @param tempsDePort fraction du quart avec protection, de 0 à 1
 */
export function attenuationEffective(
  attenuationNominale: number,
  tempsDePort: number,
): number {
  if (tempsDePort >= 1) return attenuationNominale;
  if (tempsDePort <= 0) return 0;

  const fractionExposee = 1 - tempsDePort;
  const fractionProtegee = tempsDePort * 10 ** (-attenuationNominale / 10);

  return -10 * Math.log10(fractionExposee + fractionProtegee);
}

/**
 * Niveau réellement perçu sous le protecteur.
 *
 * Sert aussi à détecter la surprotection : sous ~70 dBA, le travailleur
 * n'entend plus les alarmes ni les véhicules. La formation n'aborde pas ce
 * risque — ne rien afficher à ce sujet sans validation du formateur.
 */
export function niveauSousProtection(
  niveauDBA: number,
  attenuationNominale: number,
  tempsDePort: number,
): number {
  return niveauDBA - attenuationEffective(attenuationNominale, tempsDePort);
}

/** La double protection est-elle recommandée à ce niveau ? (diapo 14) */
export function doubleProtectionRecommandee(niveauDBA: number): boolean {
  return niveauDBA > SEUIL_DOUBLE_PROTECTION_DBA;
}
