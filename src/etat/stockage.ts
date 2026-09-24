/**
 * Persistance locale, validée et partagée entre les écrans.
 *
 * Rien ne quitte l'appareil : pas de compte, pas de serveur, pas de donnée
 * transmise. C'est ce qui permet au site de fonctionner sous terre et d'éviter
 * entièrement la question du consentement.
 *
 * Ce qui est lu est nettoyé : une valeur corrompue (mauvais type, module
 * inconnu, facteur hors liste) retombe sur la valeur par défaut au lieu de
 * casser un écran. Une écriture prévient tous les écrans abonnés à la même clé,
 * et un autre onglet du même site suit aussi.
 */

import { useCallback, useRef, useSyncExternalStore } from 'react';

export const PREFIXE = 'bruit:';
export const EVENEMENT_STOCKAGE = 'bruit:stockage-change';

const memoire = new Map<string, unknown>();
const MODULES_CONNUS = new Set(['pourquoi', 'decibel', 'exposition', 'dommages', 'choisir', 'porter']);

/** Clés qui appartiennent à la formation d'un travailleur (voir `reinitialiserFormation`). */
export const CLES_FORMATION = ['profil', 'nom', 'modules-faits', 'validations', 'quiz-resultat', 'quiz-etat'] as const;

type Validateur<T> = (valeur: unknown) => valeur is T;

/** Rend une valeur lue conforme au type attendu, sinon la valeur par défaut. */
export function nettoyerStockage<T>(cle: string, valeur: unknown, defaut: T, valider?: Validateur<T>): T {
  if (cle === 'modules-faits') {
    if (!Array.isArray(valeur)) return defaut;
    const propres = [...new Set(valeur.filter((id): id is string => typeof id === 'string' && MODULES_CONNUS.has(id)))];
    const identique = propres.length === valeur.length && propres.every((id, i) => id === valeur[i]);
    return (identique ? valeur : propres) as T;
  }
  if (cle === 'facteur-bouchons' && ![0.5, 0.6, 0.7].includes(valeur as number)) return defaut;
  if (valider) return valider(valeur) ? valeur : defaut;
  if (valeur === null || valeur === undefined) return defaut;
  if (typeof defaut === 'number') return (typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : defaut) as T;
  if (Array.isArray(defaut)) return (Array.isArray(valeur) ? valeur : defaut) as T;
  if (typeof defaut === 'object' && defaut !== null) {
    return (typeof valeur === 'object' && !Array.isArray(valeur) ? valeur : defaut) as T;
  }
  if (defaut === null) return valeur as T;
  return (typeof valeur === typeof defaut ? valeur : defaut) as T;
}

/** Lit une clé (mémoire d'abord, puis localStorage), nettoyée. */
export function lireStockage<T>(cle: string, defaut: T, valider?: Validateur<T>): T {
  if (!memoire.has(cle)) {
    try {
      const brut = localStorage.getItem(PREFIXE + cle);
      memoire.set(cle, brut === null ? defaut : JSON.parse(brut));
    } catch {
      memoire.set(cle, defaut);
    }
  }
  const propre = nettoyerStockage(cle, memoire.get(cle), defaut, valider);
  memoire.set(cle, propre);
  return propre;
}

/** Ancien nom, conservé pour les appels directs (profil, nom). */
export const lire = lireStockage;

function notifier(cles: readonly string[]) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENEMENT_STOCKAGE, { detail: { cles } }));
  }
}

/** Écrit une clé ; retourne `false` si le stockage a refusé (plein, navigation privée). */
export function ecrireStockage<T>(cle: string, valeur: T): boolean {
  memoire.set(cle, valeur);
  let sauvegarde = true;
  try {
    localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
  } catch {
    // Le site reste utilisable en mémoire ; seule la persistance est perdue.
    sauvegarde = false;
  }
  notifier([cle]);
  return sauvegarde;
}

/** Efface la formation d'un travailleur (profil, progression, quiz), garde les réglages. */
export function reinitialiserFormation(): boolean {
  let efface = true;
  for (const cle of CLES_FORMATION) {
    memoire.set(cle, undefined);
    try {
      localStorage.removeItem(PREFIXE + cle);
    } catch {
      efface = false;
    }
  }
  notifier(CLES_FORMATION);
  return efface;
}

export function useStockage<T>(
  cle: string,
  defaut: T | (() => T),
  valider?: Validateur<T>,
): [T, (valeur: T | ((precedent: T) => T)) => void] {
  // La valeur par défaut est calculée une fois (elle peut être coûteuse) et
  // reste stable : `useSyncExternalStore` exige un instantané identique tant
  // que rien n'a changé.
  const defautRef = useRef<{ valeur: T } | null>(null);
  if (defautRef.current === null) {
    defautRef.current = { valeur: typeof defaut === 'function' ? (defaut as () => T)() : defaut };
  }
  const defautStable = defautRef.current.valeur;

  const lireInstantane = useCallback(
    () => lireStockage(cle, defautStable, valider),
    [cle, defautStable, valider],
  );
  const abonner = useCallback(
    (actualiser: () => void) => {
      const surChangement = (evt: Event) => {
        if ((evt as CustomEvent<{ cles: string[] }>).detail.cles.includes(cle)) actualiser();
      };
      const surAutreOnglet = (evt: StorageEvent) => {
        if (evt.key !== null && evt.key !== PREFIXE + cle) return;
        try {
          memoire.set(cle, evt.newValue === null ? undefined : JSON.parse(evt.newValue));
        } catch {
          memoire.set(cle, undefined);
        }
        actualiser();
      };
      window.addEventListener(EVENEMENT_STOCKAGE, surChangement);
      window.addEventListener('storage', surAutreOnglet);
      return () => {
        window.removeEventListener(EVENEMENT_STOCKAGE, surChangement);
        window.removeEventListener('storage', surAutreOnglet);
      };
    },
    [cle],
  );
  const valeur = useSyncExternalStore(abonner, lireInstantane, () => defautStable);
  const changer = useCallback(
    (suivant: T | ((precedent: T) => T)) => {
      const prochaine =
        typeof suivant === 'function' ? (suivant as (precedent: T) => T)(lireInstantane()) : suivant;
      ecrireStockage(cle, nettoyerStockage(cle, prochaine, defautStable, valider));
    },
    [cle, defautStable, valider, lireInstantane],
  );
  return [valeur, changer];
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
  memoire.clear();
  location.reload();
}
