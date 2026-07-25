/**
 * Persistance locale.
 *
 * Rien ne quitte l'appareil : pas de compte, pas de serveur, pas de donnée
 * transmise. C'est ce qui permet au site de fonctionner sous terre et d'éviter
 * entièrement la question du consentement.
 */

import { useCallback, useEffect, useState } from 'react';

const PREFIXE = 'bruit:';

function lire<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(PREFIXE + cle);
    return brut === null ? defaut : (JSON.parse(brut) as T);
  } catch {
    return defaut;
  }
}

export function useStockage<T>(
  cle: string,
  defaut: T,
): [T, (valeur: T | ((precedent: T) => T)) => void] {
  const [valeur, setValeur] = useState<T>(() => lire(cle, defaut));

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

export function useProgression() {
  const [faits, setFaits] = useStockage<string[]>('modules-faits', []);

  const marquerFait = useCallback(
    (id: string) => setFaits((precedent) => [...new Set([...precedent, id])]),
    [setFaits],
  );

  const reinitialiser = useCallback(() => setFaits([]), [setFaits]);

  return { faits, marquerFait, reinitialiser };
}
