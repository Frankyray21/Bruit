/**
 * Persistance locale.
 *
 * Rien ne quitte l'appareil : pas de compte, pas de serveur, pas de donnée
 * transmise. C'est ce qui permet au site de fonctionner sous terre et d'éviter
 * entièrement la question du consentement.
 */

import { useEffect, useState } from 'react';

export const PREFIXE = 'bruit:';

export function lire<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(PREFIXE + cle);
    return brut === null ? defaut : (JSON.parse(brut) as T);
  } catch {
    return defaut;
  }
}

export function useStockage<T>(
  cle: string,
  defaut: T | (() => T),
): [T, (valeur: T | ((precedent: T) => T)) => void] {
  const [valeur, setValeur] = useState<T>(() => {
    const sentinelle = Symbol('absent');
    const lu = lire<T | symbol>(cle, sentinelle);
    if (lu !== sentinelle) return lu as T;
    return typeof defaut === 'function' ? (defaut as () => T)() : defaut;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
    } catch {
      // Stockage plein ou navigation privée : le site reste utilisable, seule
      // la progression est perdue.
    }
  }, [cle, valeur]);

  return [valeur, setValeur];
}

/**
 * Efface tout ce que le site a mémorisé sur cet appareil, puis recharge.
 *
 * Sert au formateur qui prête un téléphone ou une tablette à plusieurs
 * travailleurs : chacun repart de zéro, sans trace du précédent.
 */
export function effacerTout(): void {
  try {
    const cles: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle && cle.startsWith(PREFIXE)) cles.push(cle);
    }
    cles.forEach((c) => localStorage.removeItem(c));
    // Ancienne clé de la bannière d'installation, sans préfixe.
    localStorage.removeItem('installer-masque');
  } catch {
    // Rien à effacer, ou stockage inaccessible.
  }
  location.reload();
}
