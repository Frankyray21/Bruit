import { describe, expect, it } from 'vitest';
import { echelleDose } from '../Graphe.js';

describe('échelle de l horloge de dose', () => {
  it('garde 0-100 % au minimum, avec des graduations rondes', () => {
    expect(echelleDose(0)).toEqual({ max: 100, pas: 25 });
    expect(echelleDose(60)).toEqual({ max: 100, pas: 25 });
  });
  it('montre la courbe au complet', () => {
    expect(echelleDose(347)).toEqual({ max: 400, pas: 100 });
    expect(echelleDose(1200)).toEqual({ max: 1250, pas: 250 });
    expect(echelleDose(100_060)).toEqual({ max: 125_000, pas: 25_000 });
  });
  it('n a jamais plus de cinq graduations au-dessus de zéro', () => {
    for (const d of [1, 99, 101, 250, 999, 4321, 55_555, 100_000]) {
      const { max, pas } = echelleDose(d);
      expect(max / pas).toBeLessThanOrEqual(5);
      expect(max).toBeGreaterThanOrEqual(d);
    }
  });
});
