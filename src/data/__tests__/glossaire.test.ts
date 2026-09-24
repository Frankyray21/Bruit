import { describe, expect, it } from 'vitest';
import { GLOSSAIRE, ficheGlossaire } from '../glossaire.js';

describe('glossaire', () => {
  it('a des identifiants uniques, en minuscules sans accent', () => {
    const ids = GLOSSAIRE.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });
  it('chaque fiche est complète et cite sa diapo', () => {
    for (const f of GLOSSAIRE) {
      expect(f.terme.length).toBeGreaterThan(2);
      expect(f.court.length).toBeGreaterThan(20);
      expect(f.details.length).toBeGreaterThan(0);
      expect(f.aRetenir.length).toBeGreaterThan(20);
      expect(f.source).toMatch(/^diapos? \d/);
    }
  });
  it('retrouve une fiche par identifiant, et rien pour un inconnu', () => {
    expect(ficheGlossaire('acouphenes')?.terme).toBe('Acouphènes');
    expect(ficheGlossaire('inconnu')).toBeUndefined();
  });
});
