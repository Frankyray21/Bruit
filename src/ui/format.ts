/**
 * Mise en forme des nombres.
 *
 * La formation écrit « 114,9 dBA » et « 97,8 dBA ». Le site doit faire pareil :
 * un travailleur qui voit « 114.9 » sur son téléphone et « 114,9 » sur la
 * diapo se demande si ce sont les mêmes chiffres.
 */

const LOCALE = 'fr-CA';

/** Un nombre avec un nombre fixe de décimales, séparateur français. */
export function nb(valeur: number, decimales = 1): string {
  if (!Number.isFinite(valeur)) return '—';
  return valeur.toLocaleString(LOCALE, {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/** Un entier avec séparateur de milliers (espace insécable en français). */
export function entier(valeur: number): string {
  if (!Number.isFinite(valeur)) return '—';
  return Math.round(valeur).toLocaleString(LOCALE);
}

/**
 * Un pourcentage de dose. Sous 1 %, on garde une décimale : « 0,3 % » dit que
 * la pause pèse quelque chose de négligeable, « 0 % » laisserait croire qu'elle
 * ne compte pas du tout.
 */
export function pourcent(valeur: number): string {
  if (!Number.isFinite(valeur)) return '—';
  return valeur < 1 ? `${nb(valeur, 1)} %` : `${entier(valeur)} %`;
}
