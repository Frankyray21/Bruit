/** Stockage local validé, partagé entre les écrans. Aucun envoi de données. */
import { useCallback, useSyncExternalStore } from 'react';
const PREFIXE = 'bruit:';
export const EVENEMENT_STOCKAGE = 'bruit:stockage-change';
const memoire = new Map<string, unknown>();
const MODULES_CONNUS = new Set(['pourquoi', 'decibel', 'exposition', 'dommages', 'choisir', 'porter']);
const MODULES_VIDES: string[] = [];
type Validateur<T> = (valeur: unknown) => valeur is T;

export function nettoyerStockage<T>(cle: string, valeur: unknown, defaut: T, valider?: Validateur<T>): T {
  if (cle === 'modules-faits') {
    if (!Array.isArray(valeur)) return defaut;
    const propres = [...new Set(valeur.filter((id): id is string => typeof id === 'string' && MODULES_CONNUS.has(id)))];
    return (propres.length === valeur.length && propres.every((id, i) => id === valeur[i]) ? valeur : propres) as T;
  }
  if (cle === 'facteur-bouchons' && ![0.5, 0.6, 0.7].includes(valeur as number)) return defaut;
  if (cle === 'dernier-module' && valeur !== null && !MODULES_CONNUS.has(valeur as string)) return defaut;
  if (valider) return valider(valeur) ? valeur : defaut;
  if (valeur === null || valeur === undefined) return defaut;
  if (typeof defaut === 'number') return (typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : defaut) as T;
  if (Array.isArray(defaut)) return (Array.isArray(valeur) ? valeur : defaut) as T;
  if (typeof defaut === 'object' && defaut !== null) return (typeof valeur === 'object' && !Array.isArray(valeur) ? valeur : defaut) as T;
  if (defaut === null) return valeur as T;
  return (typeof valeur === typeof defaut ? valeur : defaut) as T;
}

export function lireStockage<T>(cle: string, defaut: T, valider?: Validateur<T>): T {
  if (!memoire.has(cle)) {
    try {
      const brut = localStorage.getItem(PREFIXE + cle);
      memoire.set(cle, brut === null ? defaut : JSON.parse(brut));
    } catch { memoire.set(cle, defaut); }
  }
  const propre = nettoyerStockage(cle, memoire.get(cle), defaut, valider);
  memoire.set(cle, propre);
  return propre;
}
function notifier(cles: readonly string[]) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVENEMENT_STOCKAGE, { detail: { cles } }));
}
export function ecrireStockage<T>(cle: string, valeur: T): boolean {
  memoire.set(cle, valeur);
  let sauvegarde = true;
  try { localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur)); }
  catch { sauvegarde = false; }
  notifier([cle]);
  return sauvegarde;
}
/** Appelée seulement après confirmation. Conserve les réglages des calculateurs. */
export function reinitialiserFormation(): boolean {
  const cles = ['modules-faits', 'nom', 'quiz-v1', 'dernier-module'];
  let efface = true;
  cles.forEach((cle) => {
    memoire.set(cle, undefined);
    try { localStorage.removeItem(PREFIXE + cle); } catch { efface = false; }
  });
  notifier(cles);
  return efface;
}
export function useStockage<T>(cle: string, defaut: T, valider?: Validateur<T>): [T, (valeur: T | ((precedent: T) => T)) => void] {
  const lire = useCallback(() => lireStockage(cle, defaut, valider), [cle, defaut, valider]);
  const abonner = useCallback((actualiser: () => void) => {
    const surChangement = (evt: Event) => {
      if ((evt as CustomEvent<{ cles: string[] }>).detail.cles.includes(cle)) actualiser();
    };
    const surAutreOnglet = (evt: StorageEvent) => {
      if (evt.key !== null && evt.key !== PREFIXE + cle) return;
      try { memoire.set(cle, evt.newValue === null ? undefined : JSON.parse(evt.newValue)); }
      catch { memoire.set(cle, undefined); }
      actualiser();
    };
    window.addEventListener(EVENEMENT_STOCKAGE, surChangement);
    window.addEventListener('storage', surAutreOnglet);
    return () => {
      window.removeEventListener(EVENEMENT_STOCKAGE, surChangement);
      window.removeEventListener('storage', surAutreOnglet);
    };
  }, [cle]);
  const valeur = useSyncExternalStore(abonner, lire, () => defaut);
  const changer = useCallback((suivant: T | ((precedent: T) => T)) => {
    const valeur = typeof suivant === 'function' ? (suivant as (precedent: T) => T)(lire()) : suivant;
    ecrireStockage(cle, nettoyerStockage(cle, valeur, defaut, valider));
  }, [cle, defaut, valider, lire]);
  return [valeur, changer];
}
export function useProgression() {
  const [faits, setFaits] = useStockage<string[]>('modules-faits', MODULES_VIDES);
  const marquerFait = useCallback((id: string) => setFaits((precedent) => [...new Set([...precedent, id])]), [setFaits]);
  const reinitialiser = useCallback(() => setFaits([]), [setFaits]);
  return { faits, marquerFait, reinitialiser };
}
