/**
 * Sommation de sources et échelle d'énergie.
 *
 * Voir docs/modele-de-calcul.md §7.
 *
 * La formation affirme « à chaque 3 dBA, l'impact est doublé » (diapo 4) sans
 * jamais l'expliquer : c'est un axiome à croire. Ces deux fonctions le rendent
 * démontrable, et devraient donc précéder tout le reste du parcours.
 */

/** Énergie sonore relative à un niveau de référence. */
export function energieRelative(niveauDBA: number, referenceDBA = 85): number {
  return 10 ** ((niveauDBA - referenceDBA) / 10);
}

/**
 * Niveau résultant de plusieurs sources simultanées.
 *
 * Deux machines à 95 dBA ne font pas 190 dBA mais 98,01 — c'est exactement la
 * règle des 3 dBA. Et éteindre la source la plus faible ne sert presque à rien :
 * passer de [100, 90] à [100] fait gagner 0,4 dB.
 */
export function sommeSources(niveauxDBA: readonly number[]): number {
  if (niveauxDBA.length === 0) return Number.NEGATIVE_INFINITY;

  const energieTotale = niveauxDBA.reduce(
    (total, niveau) => total + 10 ** (niveau / 10),
    0,
  );

  return 10 * Math.log10(energieTotale);
}

/**
 * Gain obtenu en éteignant une source donnée.
 *
 * Sert à répondre à la vraie question du comité SST : sur quelle machine faut-il
 * intervenir en premier ?
 */
export function gainSiEteinte(
  niveauxDBA: readonly number[],
  index: number,
): number {
  const restantes = niveauxDBA.filter((_, i) => i !== index);
  return sommeSources(niveauxDBA) - sommeSources(restantes);
}
