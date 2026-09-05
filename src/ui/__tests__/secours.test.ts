import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const html = readFileSync(new URL('../../../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)![1]!;
const origine = 'https://frankyray21.github.io';
const bruit = `${origine}/Bruit/`;
const tms = `${origine}/TMS/`;
const rodBot = `${origine}/RodBot/`;

function pageDeSecours({ echecCache = false, base = '/Bruit/' } = {}) {
  const scopes = [bruit, tms, rodBot, `${origine}/`, `${bruit}autre/`];
  const registrations = scopes.map(scope => ({ scope, unregister: vi.fn(async () => true) }));
  const nomsCaches = [
    `workbox-precache-v2-${bruit}`,
    `workbox-precache-v1-${bruit}`,
    `workbox-runtime-${bruit}`,
    `workbox-precache-v2-${tms}`,
    `workbox-runtime-${rodBot}`,
    `workbox-precache-v2-${origine}/`,
    `workbox-precache-v2-${bruit}autre/`,
    `workbox-precache-v2-${origine}/Bruit-copie/`,
    `mes-documents-${bruit}`,
    'autre-cache-important',
  ];
  const cacheStorage = {
    keys: vi.fn(async () => nomsCaches),
    delete: vi.fn(async (_nom: string) => { if (echecCache) throw new Error('Accès refusé'); return true; }),
  };
  const progression = { 'bruit-progression': '["mesurer"]', 'tms-progression': '[1,2]', 'rodbot-etat': 'conserver' };
  const stockage = {
    ...progression,
    clear: vi.fn(),
    removeItem: vi.fn(),
    setItem: vi.fn(),
  };
  const handlers = new Map<string, () => Promise<unknown>>();
  const bouton = {
    disabled: false,
    textContent: '',
    addEventListener: (type: string, callback: () => Promise<unknown>) => handlers.set(type, callback),
  };
  const details = { textContent: '', style: { display: '' } };
  const location = {
    href: `${origine}/Bruit/?mode=terrain&neuf=ancien#/quiz`,
    origin: origine,
    pathname: '/Bruit/',
    replace: vi.fn(),
  };
  const window = { addEventListener: vi.fn(), caches: cacheStorage };
  runInNewContext(script.replace('%BASE_URL%', base), {
    window,
    navigator: { serviceWorker: { getRegistrations: vi.fn(async () => registrations) } },
    document: { getElementById: (id: string) => id === 'reinitialiser' ? bouton : details },
    caches: cacheStorage,
    location,
    localStorage: stockage,
    setTimeout: vi.fn(),
    URL,
    Date: { now: () => 123456 },
  });
  return { registrations, cacheStorage, stockage, progression, location, bouton, details, cliquer: () => handlers.get('click')!() };
}

describe('Récupération isolée de Bruit', () => {
  it('ne désinscrit que la portée exacte de Bruit parmi trois apps, la racine et un enfant', async () => {
    const page = pageDeSecours();
    await page.cliquer();
    expect(page.registrations.filter(r => r.unregister.mock.calls.length).map(r => r.scope)).toEqual([bruit]);
  });

  it('ne supprime que les caches Workbox de cette portée, y compris une ancienne version', async () => {
    const page = pageDeSecours();
    await page.cliquer();
    expect(page.cacheStorage.delete.mock.calls.map(c => c[0])).toEqual([
      `workbox-precache-v2-${bruit}`, `workbox-precache-v1-${bruit}`, `workbox-runtime-${bruit}`,
    ]);
  });

  it('conserve la progression, les paramètres de navigation et le hash', async () => {
    const page = pageDeSecours();
    await page.cliquer();
    expect(page.stockage.clear).not.toHaveBeenCalled();
    expect(page.stockage.removeItem).not.toHaveBeenCalled();
    expect(page.stockage.setItem).not.toHaveBeenCalled();
    for (const [cle, valeur] of Object.entries(page.progression)) {
      expect(page.stockage[cle as keyof typeof page.stockage]).toBe(valeur);
    }
    const rechargement = new URL(page.location.replace.mock.calls[0]![0] as string);
    expect(rechargement.pathname).toBe('/Bruit/');
    expect(rechargement.searchParams.get('mode')).toBe('terrain');
    expect(rechargement.searchParams.getAll('neuf')).toEqual(['123456']);
    expect(rechargement.hash).toBe('#/quiz');
  });

  it('explique un échec du nettoyage sans élargir la suppression ou recharger silencieusement', async () => {
    const page = pageDeSecours({ echecCache: true });
    await page.cliquer();
    expect(page.location.replace).not.toHaveBeenCalled();
    expect(page.details.textContent).toContain('cache de Bruit');
    expect(page.bouton.disabled).toBe(false);
    expect(page.cacheStorage.delete.mock.calls.every(c => String(c[0]).endsWith(bruit))).toBe(true);
  });

  it('respecte aussi un déploiement à la racine sans toucher aux apps des sous-dossiers', async () => {
    const page = pageDeSecours({ base: '/' });
    await page.cliquer();
    expect(page.registrations.filter(r => r.unregister.mock.calls.length).map(r => r.scope)).toEqual([`${origine}/`]);
    expect(page.cacheStorage.delete.mock.calls.map(c => c[0])).toEqual([`workbox-precache-v2-${origine}/`]);
  });
});
