import { describe, expect, it } from 'vitest';
import { energieRelative, gainSiEteinte, sommeSources } from '../sources.js';

describe('sommation de sources', () => {
  it('deux machines identiques ajoutent exactement 3 dB — la règle de la diapo 4', () => {
    expect(sommeSources([95, 95])).toBeCloseTo(98.01, 2);
  });

  it("le bruit ne s'additionne pas arithmétiquement", () => {
    expect(sommeSources([95, 95])).toBeLessThan(190);
  });

  it.each([
    [[100, 90], 100.41],
    [[103, 66], 103.0],
    [[98, 95, 92], 100.44],
  ])('%j → %f dBA', (niveaux, attendu) => {
    expect(sommeSources(niveaux)).toBeCloseTo(attendu, 2);
  });

  it('dix machines identiques ajoutent 10 dB', () => {
    expect(sommeSources(Array<number>(10).fill(95))).toBeCloseTo(105, 2);
  });
});

describe('gain obtenu en éteignant une source', () => {
  it('éteindre la source la plus faible ne sert presque à rien', () => {
    expect(gainSiEteinte([100, 90], 1)).toBeCloseTo(0.41, 2);
  });

  it('éteindre la source dominante change tout', () => {
    expect(gainSiEteinte([100, 90], 0)).toBeCloseTo(10.41, 2);
  });
});

describe('échelle d’énergie', () => {
  it.each([
    [10, 10],
    [20, 100],
    [30, 1000],
  ])('+%i dBA = ×%i énergie, exactement', (ecart, facteur) => {
    expect(energieRelative(85 + ecart)).toBeCloseTo(facteur, 6);
  });

  // La formation dit « à chaque 3 dBA, l'impact est doublé » (diapo 4). C'est
  // une approximation : le vrai doublement d'énergie vaut 10·log10(2) =
  // 3,0103 dB. Le RSST adopte 3 dB tout rond comme convention réglementaire,
  // donc le domaine garde 3 pour la durée permise — mais l'outil qui montre
  // l'énergie doit afficher la valeur physique, pas la convention.
  it('« 3 dBA double l’impact » est une approximation de 3,0103 dB', () => {
    expect(energieRelative(88)).toBeCloseTo(1.995, 3);
    expect(energieRelative(85 + 10 * Math.log10(2))).toBeCloseTo(2, 6);
  });

  it.each([
    [3, 1.995],
    [6, 3.981],
  ])('+%i dBA = ×%f énergie', (ecart, facteur) => {
    expect(energieRelative(85 + ecart)).toBeCloseTo(facteur, 3);
  });

  it("le jackleg reçoit 977 fois l'énergie permise", () => {
    expect(energieRelative(114.9)).toBeCloseTo(977, 0);
  });
});
