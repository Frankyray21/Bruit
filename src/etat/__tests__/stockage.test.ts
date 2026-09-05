import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

let donnees: Map<string, string>;
beforeEach(() => {
  vi.resetModules();
  donnees = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (cle: string) => donnees.get(cle) ?? null,
    setItem: (cle: string, valeur: string) => donnees.set(cle, valeur),
    removeItem: (cle: string) => donnees.delete(cle),
  });
  vi.stubGlobal('window', new EventTarget());
});
afterEach(() => vi.unstubAllGlobals());

describe('lecture validée', () => {
  it.each(['{invalide', '{}', 'null', '42', 'true'])('un nom stocké invalide ne casse pas trim : %s', async (brut) => {
    donnees.set('bruit:nom', brut);
    const { lireStockage } = await import('../stockage.js');
    expect(lireStockage('nom', '')).toBe('');
  });
  it('conserve un nom valide sans le transmettre', async () => {
    donnees.set('bruit:nom', '"Travailleur test"');
    const { lireStockage } = await import('../stockage.js');
    expect(lireStockage('nom', '')).toBe('Travailleur test');
  });
  it('nettoie les modules inconnus, répétés et mal typés', async () => {
    donnees.set('bruit:modules-faits', '["porter","porter",12,"inconnu",{},"decibel"]');
    const { lireStockage } = await import('../stockage.js');
    const resultat = lireStockage<string[]>('modules-faits', []);
    expect(resultat).toEqual(['porter', 'decibel']);
    expect(lireStockage('modules-faits', [])).toBe(resultat);
  });
  it('remplace une progression objet par une liste', async () => {
    donnees.set('bruit:modules-faits', '{}');
    const { lireStockage } = await import('../stockage.js');
    expect(lireStockage('modules-faits', [])).toEqual([]);
  });
  it.each([null, {}, '0.6', 0, -1, 1, 0.65])('refuse un facteur non proposé : %j', async (valeur) => {
    donnees.set('bruit:facteur-bouchons', JSON.stringify(valeur));
    const { lireStockage } = await import('../stockage.js');
    expect(lireStockage('facteur-bouchons', 0.6)).toBe(0.6);
  });
  it.each([0.5, 0.6, 0.7])('conserve le réglage existant %s', async (valeur) => {
    donnees.set('bruit:facteur-bouchons', String(valeur));
    const { lireStockage } = await import('../stockage.js');
    expect(lireStockage('facteur-bouchons', 0.6)).toBe(valeur);
  });
  it('valide les routes de reprise et les booléens', async () => {
    donnees.set('bruit:dernier-module', '"inconnu"');
    donnees.set('bruit:presentation', '"false"');
    const { lireStockage } = await import('../stockage.js');
    expect(lireStockage<string | null>('dernier-module', null)).toBeNull();
    expect(lireStockage('presentation', false)).toBe(false);
  });
});

describe('stockage indisponible et remise à zéro', () => {
  it('reste utilisable en mémoire si toutes les opérations de stockage échouent', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw Error('refusé'); },
      setItem: () => { throw Error('refusé'); },
      removeItem: () => { throw Error('refusé'); },
    });
    const { lireStockage, ecrireStockage, reinitialiserFormation } = await import('../stockage.js');
    expect(lireStockage('nom', '')).toBe('');
    expect(ecrireStockage('nom', 'Test')).toBe(false);
    expect(lireStockage('nom', '')).toBe('Test');
    expect(reinitialiserFormation()).toBe(false);
    expect(lireStockage('nom', '')).toBe('');
  });
  it('n’efface que la formation et préserve calculs, présentation et autres sites', async () => {
    const { ecrireStockage, lireStockage, reinitialiserFormation } = await import('../stockage.js');
    for (const cle of ['nom', 'modules-faits', 'quiz-v1', 'dernier-module']) ecrireStockage(cle, 'ancien');
    ecrireStockage('facteur-bouchons', 0.7);
    ecrireStockage('presentation', true);
    ecrireStockage('installer-masque', true);
    donnees.set('tms:progression', 'conserver');
    expect(reinitialiserFormation()).toBe(true);
    expect([...donnees.keys()].sort()).toEqual(['bruit:facteur-bouchons', 'bruit:installer-masque', 'bruit:presentation', 'tms:progression']);
    expect(lireStockage('nom', '')).toBe('');
    expect(lireStockage('modules-faits', [])).toEqual([]);
    expect(lireStockage('facteur-bouchons', 0.6)).toBe(0.7);
  });
  it('notifie les écrans lors d’une écriture et du reset', async () => {
    const { EVENEMENT_STOCKAGE, ecrireStockage, reinitialiserFormation } = await import('../stockage.js');
    const evenements: string[][] = [];
    window.addEventListener(EVENEMENT_STOCKAGE, (evt) => evenements.push((evt as CustomEvent<{ cles: string[] }>).detail.cles));
    ecrireStockage('nom', 'Test');
    reinitialiserFormation();
    expect(evenements).toEqual([['nom'], ['modules-faits', 'nom', 'quiz-v1', 'dernier-module']]);
    expect(donnees.has('nom')).toBe(false);
  });
});
