import { describe, expect, it } from 'vitest';
import {
  contrainte,
  dommageCce,
  dommageCci,
  frequenceGreenwood,
  positionGreenwood,
  vulnerabilite,
} from '../tonotopie.js';

describe('carte tonotopique de Greenwood (humain)', () => {
  it('va d’environ 20 Hz à l’apex à environ 20 kHz à la base', () => {
    expect(frequenceGreenwood(0)).toBeCloseTo(19.8, 0);
    expect(frequenceGreenwood(1)).toBeGreaterThan(20000);
    expect(frequenceGreenwood(1)).toBeLessThan(21000);
  });
  it('place 4 kHz aux deux tiers depuis l’apex (un tiers depuis la base)', () => {
    expect(positionGreenwood(4000)).toBeCloseTo(0.666, 2);
  });
  it('position et fréquence sont inverses l’une de l’autre', () => {
    for (const f of [125, 500, 1000, 4000, 8000, 16000]) {
      expect(frequenceGreenwood(positionGreenwood(f))).toBeCloseTo(f, 3);
    }
  });
});

describe('vulnérabilité et dommage', () => {
  it('rien sous 80 dBA, saturation à 120', () => {
    expect(contrainte(60)).toBe(0);
    expect(contrainte(80)).toBe(0);
    expect(contrainte(100)).toBeCloseTo(0.5);
    expect(contrainte(130)).toBe(1);
    expect(dommageCce(0.3, 79)).toBe(0);
  });
  it('l’encoche est centrée sur 4 kHz : plus vulnérable que 1 kHz et que 16 kHz', () => {
    const v4 = vulnerabilite(4000, 0.3);
    expect(v4).toBeGreaterThan(vulnerabilite(1000, 0.3));
    expect(v4).toBeGreaterThan(vulnerabilite(16000, 0.3));
    expect(vulnerabilite(4000, 0.3)).toBeGreaterThan(vulnerabilite(250, 0.3));
  });
  it('les aigus restent plus vulnérables que les graves', () => {
    expect(vulnerabilite(8000, 0.3)).toBeGreaterThan(vulnerabilite(250, 0.3));
  });
  it('l’atteinte s’étend aux fréquences voisines quand le niveau monte', () => {
    const ratio = (stress: number) => vulnerabilite(1000, stress) / vulnerabilite(4000, stress);
    expect(ratio(0.9)).toBeGreaterThan(ratio(0.1));
  });
  it('à 97 dBA, la zone des aigus près de la base est la plus touchée', () => {
    const s4k = 1 - positionGreenwood(4000);
    const d4k = dommageCce(s4k, 97);
    expect(d4k).toBeGreaterThan(dommageCce(0.9, 97)); // apex, graves
    expect(d4k).toBeGreaterThan(dommageCce(0.02, 97)); // extrême base, 20 kHz
  });
  it('externes avant internes, première rangée avant la troisième', () => {
    const s = 1 - positionGreenwood(4000);
    expect(dommageCce(s, 95, 0)).toBeGreaterThan(dommageCce(s, 95, 2));
    expect(dommageCce(s, 95, 0)).toBeGreaterThan(dommageCci(s, 95));
    expect(dommageCci(s, 95)).toBeGreaterThan(0);
  });
  it('tout est détruit dans l’encoche à 115 dBA, jamais au-delà de 1', () => {
    const s = 1 - positionGreenwood(4000);
    expect(dommageCce(s, 115)).toBeGreaterThan(0.95);
    expect(dommageCce(s, 140)).toBeLessThanOrEqual(1);
  });
});
