import { describe, expect, it } from 'vitest';
import { protectionSuffisante, verdictDose } from '../verdict.js';
import { cumulCarriere } from '../carriere.js';
import { dose } from '../rsst.js';

describe('verdict de dose', () => {
  it.each([
    [25, 'vert'],
    [75, 'jaune'],
    [397, 'rouge'],
  ])('dose de %i %% → %s', (d, niveau) => {
    expect(verdictDose(d).niveau).toBe(niveau);
  });
});

describe("l'équipement de protection suffit-il pour un quart complet ?", () => {
  it('le jackleg est le seul métier où la réponse est non', () => {
    // Même en double protection avec le meilleur bouchon : 2 h 28 permises.
    expect(protectionSuffisante(114.9, 33, 25, 0.6).niveau).toBe('critique');
  });

  it('tous les autres métiers mesurés sont couverts par une protection simple', () => {
    const autresMetiers = [100.1, 99.5, 98, 97.8, 96.5, 95.5, 94.8, 92.5, 90.9, 90.7, 89.3, 87.3];
    for (const niveau of autresMetiers) {
      expect(protectionSuffisante(niveau, 33, 25, 0.6).niveau).toBe('vert');
    }
  });

  it('le facteur de dérating déplace réellement la frontière', () => {
    // 60 % → 2 h 28 permises pour le jackleg ; 70 % → 5 h 17.
    const a60 = protectionSuffisante(114.9, 33, 25, 0.6);
    const a70 = protectionSuffisante(114.9, 33, 25, 0.7);
    expect(a60.niveau).toBe('critique');
    expect(a70.niveau).toBe('critique');
    // Les deux restent insuffisants pour 8 h, mais pas pour 5 h.
    expect(protectionSuffisante(114.9, 33, 25, 0.7, 5).niveau).toBe('jaune');
    expect(protectionSuffisante(114.9, 33, 25, 0.6, 5).niveau).toBe('critique');
  });
});

describe('cumul de carrière', () => {
  it('un foreur long trou consomme 19,2 doses permises par jour', () => {
    const quart = [{ niveauDBA: 97.8, dureeH: 8 }];
    expect(cumulCarriere(quart, 25).dosesParJour).toBeCloseTo(19.2, 1);
  });

  it('sur 25 ans, cela fait plus de 100 000 doses', () => {
    const quart = [{ niveauDBA: 97.8, dureeH: 8 }];
    expect(cumulCarriere(quart, 25).dosesTotales).toBeGreaterThan(100_000);
  });

  it("ne dit rien d'une perte auditive — c'est un compteur, pas un pronostic", () => {
    const quart = [{ niveauDBA: 97.8, dureeH: 8 }];
    const cumul = cumulCarriere(quart, 25);
    expect(Object.keys(cumul)).toEqual([
      'dosesParJour',
      'dosesParAn',
      'dosesTotales',
    ]);
    expect(cumul.dosesParJour).toBeCloseTo(dose(quart) / 100, 6);
  });
});
