import { describe, expect, it } from 'vitest';
import { hashRoute, lireRoute, prochainModule } from './navigation.js';
import { filtrerOutils, OUTILS } from './outils/catalogue.js';
describe('navigation sans perte de parcours', () => {
  const modules = ['pourquoi', 'decibel']; const outils = OUTILS.map(o => o.id);
  it('relit les liens de modules et outils', () => {
    expect(lireRoute('#formation/decibel', modules, outils)).toEqual({ zone: 'parcours', module: 'decibel' });
    expect(lireRoute('#outils/quart', modules, outils)).toEqual({ zone: 'outils', outil: 'quart' });
  });
  it('revient à un écran connu pour les URL inconnues', () => {
    for (const hash of ['#formation/inexistant', '#quiz/autre', '#formation/decibel/extra', '#%ZZ']) expect(lireRoute(hash, modules, outils)).toEqual({ zone: 'parcours' });
    expect(lireRoute('#outils/inexistant', modules, outils)).toEqual({ zone: 'outils' });
  });
  it('construit des URL rechargeables', () => {
    for (const route of [{ zone: 'parcours', module: 'decibel' }, { zone: 'outils', outil: 'quart' }, { zone: 'quiz' }, { zone: 'moi' }] as const) expect(lireRoute(hashRoute(route), modules, outils)).toEqual(route);
  });
  it('reprend le dernier module non terminé, puis le prochain', () => {
    expect(prochainModule(modules, [], 'decibel')).toBe('decibel');
    expect(prochainModule(modules, ['decibel'], 'decibel')).toBe('pourquoi');
    expect(prochainModule(modules, modules, 'decibel')).toBe('pourquoi');
    expect(prochainModule([], [])).toBeUndefined();
  });
});
describe('catalogue', () => {
  it('cherche avec ou sans accents et filtre la catégorie', () => {
    expect(filtrerOutils('durée')).toEqual(filtrerOutils('DUREE'));
    expect(filtrerOutils('bouchons', 'Protection').every(o => o.groupe === 'Protection')).toBe(true);
    expect(filtrerOutils('xxxx')).toEqual([]);
  });
  it('expose aussi les outils autrefois réservés aux modules', () => {
    expect(OUTILS.map(o => o.id)).toContain('sources'); expect(OUTILS.map(o => o.id)).toContain('carriere');
    expect(new Set(OUTILS.map(o => o.id)).size).toBe(OUTILS.length);
  });
});
