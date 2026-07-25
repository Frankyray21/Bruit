import { describe, expect, it } from 'vitest';
import {
  COEFFICIENT_LEX,
  dose,
  dureePermise,
  formaterDuree,
  momentLimiteAtteinte,
  niveauEquivalent8h,
} from '../rsst.js';

describe('durée permise — table de la diapo 6', () => {
  // Les 6 lignes du tableau réglementaire, une par une.
  it.each([
    [82, 16],
    [83, 12],
    [85, 8],
    [88, 4],
    [91, 2],
    [94, 1],
  ])('%i dBA → %i h', (niveau, heures) => {
    expect(dureePermise(niveau)).toBe(heures);
  });

  it('la table prime sur la formule à 83 dBA (le règlement arrondit 12,70 à 12)', () => {
    expect(dureePermise(83)).toBe(12);
    expect(8 / 2 ** ((83 - 85) / 3)).toBeCloseTo(12.7, 1);
  });
});

describe('durée permise — extrapolation au-delà de la table', () => {
  // Le terrain dépasse largement les 94 dBA de la dernière ligne.
  it.each([
    ['foreur long trou', 97.8, 0.4156],
    ['câbleur', 100.1, 0.2443],
    ['mineur au jackleg', 114.9, 0.008],
  ])('%s : %f dBA', (_nom, niveau, heures) => {
    expect(dureePermise(niveau)).toBeCloseTo(heures, 3);
  });

  it('le jackleg tient 29 secondes sans protection', () => {
    expect(formaterDuree(dureePermise(114.9))).toBe('29 s');
  });
});

describe('formatage des durées', () => {
  it.each([
    [0.008, '29 s'],
    [0.2443, '15 min'],
    [2.4626, '2 h 28'],
    [8, '8 h 00'],
  ])('%f h → %s', (heures, attendu) => {
    expect(formaterDuree(heures)).toBe(attendu);
  });
});

describe('dose et niveau équivalent', () => {
  it('8 h à 85 dBA valent exactement 100 % de la dose', () => {
    expect(dose([{ niveauDBA: 85, dureeH: 8 }])).toBeCloseTo(100, 6);
  });

  it('le silence ne rembourse pas le bruit : 2 h à 66 dBA pèsent 0,3 %', () => {
    expect(dose([{ niveauDBA: 66, dureeH: 2 }])).toBeCloseTo(0.3, 1);
  });

  it("l'intensité écrase la durée : 30 min à 103 dBA pèsent plus que 1 h 30 à 95", () => {
    const drillAAir = dose([{ niveauDBA: 103, dureeH: 0.5 }]);
    const meulage = dose([{ niveauDBA: 95, dureeH: 1.5 }]);
    expect(drillAAir).toBeGreaterThan(meulage);
  });

  // Le test que le coefficient 10 fait échouer : il donnerait 115,003.
  it.each([88, 97.8, 114.9])(
    'aller-retour : 8 h à %f dBA redonnent ce niveau',
    (niveau) => {
      const d = dose([{ niveauDBA: niveau, dureeH: 8 }]);
      expect(niveauEquivalent8h(d)).toBeCloseTo(niveau, 6);
    },
  );

  it('le coefficient vaut 9,9658 et non 10', () => {
    expect(COEFFICIENT_LEX).toBeCloseTo(9.9658, 4);
  });
});

describe('moment où la limite est atteinte', () => {
  // Quart type d'un soudeur d'atelier, reconstitué depuis les tâches de la
  // diapo 8. Le Leq résultant retombe sur le 91 dBA mesuré à la diapo 9.
  const quartSoudeur = [
    { nom: 'Meulage', niveauDBA: 95, dureeH: 2 },
    { nom: 'Marteau aiguille', niveauDBA: 92, dureeH: 1.5 },
    { nom: "Jet d'air", niveauDBA: 91, dureeH: 0.5 },
    { nom: 'Fraisage', niveauDBA: 85, dureeH: 2 },
    { nom: 'Nettoyage', niveauDBA: 66, dureeH: 2 },
  ];

  it('reproduit le Leq 8 h mesuré pour le Soudeur 1 (diapo 9)', () => {
    expect(niveauEquivalent8h(dose(quartSoudeur))).toBeCloseTo(91, 0);
  });

  it('la limite est atteinte après 48 minutes, dans la première tâche', () => {
    const moment = momentLimiteAtteinte(quartSoudeur);
    expect(moment).not.toBeNull();
    expect(moment! * 60).toBeCloseTo(48, 0);
  });

  it('un quart entièrement sous la norme ne déclenche jamais la limite', () => {
    expect(momentLimiteAtteinte([{ niveauDBA: 66, dureeH: 8 }])).toBeNull();
  });
});
