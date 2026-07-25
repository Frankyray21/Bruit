import { describe, expect, it } from 'vitest';
import { budgetRetrait } from '../retrait.js';
import { attenuationReelle, niveauSousProtection } from '../protection.js';

describe('budget de retrait — inversion du temps de port', () => {
  it('le contrôle retombe exactement sur 85 dBA', () => {
    // Foreur long trou avec des Laser Lite (NRR 32) dératés à 60 %.
    const attenuation = attenuationReelle(32, 0.6);
    const { tempsDePortMinimal } = budgetRetrait(97.8, attenuation);

    expect(tempsDePortMinimal).toBeCloseTo(0.959, 3);
    expect(niveauSousProtection(97.8, attenuation, tempsDePortMinimal)).toBeCloseTo(
      85,
      6,
    );
  });

  it.each([
    ['foreur long trou', 97.8, 33, 20],
    ['foreur long trou', 97.8, 25, 10],
    ['mécanicien 2 atelier', 96, 33, 33],
    ['mécanicien 2 atelier', 96, 20, 8],
  ])('%s avec un NRR %i : %i minutes de retrait', (_nom, niveau, nrr, minutes) => {
    const budget = budgetRetrait(niveau, attenuationReelle(nrr, 0.6));
    expect(budget.realisable).toBe(true);
    expect(Math.round(budget.minutesDeRetrait)).toBe(minutes);
  });

  it('aucun protecteur ne rend le jackleg réalisable', () => {
    for (const nrr of [33, 25, 20, 17]) {
      expect(budgetRetrait(114.9, attenuationReelle(nrr, 0.6)).realisable).toBe(
        false,
      );
    }
  });

  it('un NRR 20 ne suffit pas au foreur long trou', () => {
    expect(budgetRetrait(97.8, attenuationReelle(20, 0.6)).realisable).toBe(false);
  });

  it('un poste déjà sous la norme laisse le quart entier', () => {
    const budget = budgetRetrait(82, attenuationReelle(33, 0.6));
    expect(budget.realisable).toBe(true);
    expect(budget.minutesDeRetrait).toBe(480);
  });
});
