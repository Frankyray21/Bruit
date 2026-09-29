/**
 * Préparation hors-ligne : ce que le service worker ne précache pas.
 *
 * Les vidéos sont servies par un cache dédié qui gère les plages d'octets
 * (voir `vite.config.ts`). Ce cache se remplit à la première requête : on la
 * provoque nous-mêmes dès que le service worker est prêt, pour que la vidéo
 * soit là avant que le travailleur descende. Fonctions pures, testables.
 */

/** Nom du cache des vidéos — doit rester identique à `vite.config.ts`. */
export const CACHE_VIDEOS = 'bruit-videos';

/** Adresses absolues des vidéos livrées avec le site. */
export function adressesVideos(base: string, fichiers: readonly string[]): string[] {
  return fichiers.map((f) => `${base}videos/${f}`);
}

/** Une adresse est-elle déjà dans le cache des vidéos ? */
export async function dejaEnCache(url: string): Promise<boolean> {
  if (typeof caches === 'undefined') return false;
  try {
    const cache = await caches.open(CACHE_VIDEOS);
    return (await cache.match(url, { ignoreSearch: true })) !== undefined;
  } catch {
    return false;
  }
}

/**
 * Télécharge (via le service worker, qui met en cache) chaque vidéo absente.
 * Renvoie `true` si tout est en cache à la fin, `false` sinon (hors-ligne
 * avant la fin, stockage refusé…). Ne lève jamais.
 */
export async function preparerVideos(urls: readonly string[]): Promise<boolean> {
  let tout = true;
  for (const url of urls) {
    if (await dejaEnCache(url)) continue;
    try {
      const r = await fetch(url);
      if (!r.ok) {
        tout = false;
        continue;
      }
      // Consommer le corps garantit que le service worker a tout reçu.
      await r.blob();
      if (!(await dejaEnCache(url))) tout = false;
    } catch {
      tout = false;
    }
  }
  return tout;
}

let preparation: Promise<boolean> | null = null;

/**
 * Lance (une seule fois par page) la préparation complète : attendre le
 * service worker, puis remplir le cache des vidéos. À appeler à la racine
 * de l'app dès le montage ; les écrans lisent simplement la promesse.
 */
export function lancerPreparation(base: string, fichiers: readonly string[]): Promise<boolean> {
  if (preparation) return preparation;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    preparation = Promise.resolve(false);
    return preparation;
  }
  preparation = navigator.serviceWorker.ready
    .then(() => preparerVideos(adressesVideos(base, fichiers)))
    .catch(() => false);
  return preparation;
}
