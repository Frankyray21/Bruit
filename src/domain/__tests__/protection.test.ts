import { describe, expect, it } from 'vitest';
import {
  attenuationDoubleProtection,
  attenuationEffective,
  attenuationReelle,
  doubleProtectionRecommandee,
  niveauSousProtection,
} from '../protection.js';

describe('atténuation réelle — dérating', () => {
  it("reproduit l'exemple de la diapo 14 : 60 % de NRR 32 = 19 dBA", () => {
    expect(Math.round(attenuationReelle(32, 0.6))).toBe(19);
  });

  it('le facteur change le résultat de façon non cosmétique', () => {
    expect(attenuationReelle(33, 0.6)).toBeCloseTo(19.8, 1);
    expect(attenuationReelle(33, 0.7)).toBeCloseTo(23.1, 1);
  });
});

describe('double protection — diapo 14', () => {
  it("reproduit l'exemple complet : 19 dBA + 5 = 24 dBA", () => {
    expect(Math.round(attenuationDoubleProtection(32, 25, 0.6))).toBe(24);
  });

  it("les atténuations ne s'additionnent pas : 32 + 25 ne donnent pas 57 dB", () => {
    expect(attenuationDoubleProtection(32, 25, 0.6)).toBeLessThan(30);
  });

  it('est recommandée au-delà de 105 dBA seulement', () => {
    expect(doubleProtectionRecommandee(114.9)).toBe(true);
    expect(doubleProtectionRecommandee(100.1)).toBe(false);
  });
});

describe('temps de port — table de la diapo 16', () => {
  // Les 5 lignes du tableau, avec A = 30 dB comme dans la formation.
  it.each([
    [1.0, 30],
    [0.98, 17],
    [0.95, 13],
    [0.9, 10],
    [0.5, 3],
  ])('porté %f du quart → %i dB', (tempsDePort, attendu) => {
    expect(Math.round(attenuationEffective(30, tempsDePort))).toBe(attendu);
  });

  it('10 minutes de retrait sur 8 h font tomber la protection de 30 à 17 dB', () => {
    const tempsDePort = 1 - 10 / (8 * 60);
    expect(Math.round(attenuationEffective(30, tempsDePort))).toBe(17);
  });

  it('à 50 % de port, tout protecteur plafonne sous 3,01 dB', () => {
    // Borne supérieure : -10·log10(0,5) = 3,0103. Approchée par le dessous,
    // d'autant plus vite que l'atténuation nominale est grande.
    for (const nrr of [17, 20, 25, 30, 33, 50, 100]) {
      expect(attenuationEffective(nrr, 0.5)).toBeLessThanOrEqual(3.0103);
    }
  });

  it('au-delà de 30 dB nominaux, le plafond à 50 % est atteint à 0,005 dB près', () => {
    for (const nrr of [30, 33, 50, 100]) {
      expect(attenuationEffective(nrr, 0.5)).toBeCloseTo(3.01, 2);
    }
  });

  it('un NRR 33 et un NRR 100 sont indiscernables à 50 % de port', () => {
    const ecart =
      attenuationEffective(100, 0.5) - attenuationEffective(33, 0.5);
    expect(ecart).toBeLessThan(0.01);
  });

  it('sans protection du tout, aucune atténuation', () => {
    expect(attenuationEffective(33, 0)).toBe(0);
  });
});

describe('comparateur de protecteurs', () => {
  const nrr33 = attenuationReelle(33, 0.6);
  const nrr20 = attenuationReelle(20, 0.6);

  it('un NRR 20 porté en permanence bat un NRR 33 porté 90 % du temps', () => {
    expect(attenuationEffective(nrr20, 1)).toBeGreaterThan(
      attenuationEffective(nrr33, 0.9),
    );
  });

  it('le point de bascule se situe à 94,68 % de temps de port', () => {
    const bascule = 0.9468;
    expect(attenuationEffective(nrr33, bascule)).toBeCloseTo(
      attenuationEffective(nrr20, 1),
      2,
    );
  });
});

describe('niveau sous protection', () => {
  it('le jackleg reste hors norme même avec le meilleur bouchon porté en permanence', () => {
    expect(niveauSousProtection(114.9, attenuationReelle(33, 0.6), 1)).toBeCloseTo(
      95.1,
      1,
    );
  });

  it("l'électricien tombe en surprotection sous 70 dBA", () => {
    // Absent de la formation — à valider avec le formateur avant affichage.
    expect(niveauSousProtection(87.3, attenuationReelle(33, 0.6), 1)).toBeLessThan(
      70,
    );
  });
});
