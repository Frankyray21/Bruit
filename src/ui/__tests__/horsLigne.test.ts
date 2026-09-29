import { afterEach, describe, expect, it, vi } from 'vitest';
import { adressesVideos, CACHE_VIDEOS, dejaEnCache, preparerVideos } from '../horsLigne.js';

function fauxCaches(contenu: Set<string>) {
  const cache = {
    match: async (url: string) => (contenu.has(url) ? new Response('ok') : undefined),
  };
  return { open: vi.fn(async (nom: string) => (nom === CACHE_VIDEOS ? cache : { match: async () => undefined })) };
}

afterEach(() => vi.unstubAllGlobals());

describe('préparation hors-ligne des vidéos', () => {
  it('construit les adresses à partir de la base du site', () => {
    expect(adressesVideos('/Bruit/', ['a.mp4', 'b.mp4'])).toEqual(['/Bruit/videos/a.mp4', '/Bruit/videos/b.mp4']);
  });
  it('sans API caches, rien n’est en cache', async () => {
    vi.stubGlobal('caches', undefined);
    expect(await dejaEnCache('/x.mp4')).toBe(false);
  });
  it('ne retélécharge pas ce qui est déjà en cache', async () => {
    vi.stubGlobal('caches', fauxCaches(new Set(['/Bruit/videos/a.mp4'])));
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    expect(await preparerVideos(['/Bruit/videos/a.mp4'])).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('télécharge ce qui manque et vérifie que le service worker l’a gardé', async () => {
    const contenu = new Set<string>();
    vi.stubGlobal('caches', fauxCaches(contenu));
    vi.stubGlobal('fetch', vi.fn(async (url: string) => { contenu.add(url); return new Response(new Blob(['v'])); }));
    expect(await preparerVideos(['/Bruit/videos/a.mp4'])).toBe(true);
  });
  it('signale un échec sans lever : hors-ligne ou réponse en erreur', async () => {
    vi.stubGlobal('caches', fauxCaches(new Set()));
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('hors-ligne'); }));
    expect(await preparerVideos(['/Bruit/videos/a.mp4'])).toBe(false);
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
    expect(await preparerVideos(['/Bruit/videos/a.mp4'])).toBe(false);
  });
});
