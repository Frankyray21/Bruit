import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../questions.js';
import { avancerQuiz, bonnesReponses, etatQuizValide, nouveauQuiz, repondreQuiz, SEUIL_REUSSITE } from '../etatQuiz.js';

describe('quiz reprenable', () => {
  it('conserve les 14 questions et le seuil de 80 %', () => {
    expect(QUESTIONS).toHaveLength(14);
    expect(SEUIL_REUSSITE).toBe(0.8);
    expect(11 / QUESTIONS.length >= SEUIL_REUSSITE).toBe(false);
    expect(12 / QUESTIONS.length >= SEUIL_REUSSITE).toBe(true);
  });
  it('reprend avant et après une réponse sans la compter deux fois', () => {
    const depart = nouveauQuiz();
    expect(etatQuizValide(depart)).toBe(true);
    expect(avancerQuiz(depart)).toBe(depart);
    const repondu = repondreQuiz(depart, QUESTIONS[0]!.bonne);
    expect(repondreQuiz(repondu, 0)).toBe(repondu);
    expect(bonnesReponses(repondu)).toBe(1);
    expect(etatQuizValide(JSON.parse(JSON.stringify(repondu)))).toBe(true);
    const suivant = avancerQuiz(repondu);
    expect(suivant.index).toBe(1);
    expect(suivant.reponses).toHaveLength(1);
    expect(etatQuizValide(suivant)).toBe(true);
  });
  it('fige la date au résultat et la conserve lors des réouvertures', () => {
    let etat = nouveauQuiz();
    for (const question of QUESTIONS) {
      etat = repondreQuiz(etat, question.bonne);
      etat = avancerQuiz(etat, '2026-09-05T14:00:00.000Z');
    }
    expect(bonnesReponses(etat)).toBe(14);
    expect(etat.termineLe).toBe('2026-09-05T14:00:00.000Z');
    expect(avancerQuiz(etat, '2026-10-12T14:00:00.000Z')).toBe(etat);
    expect(etatQuizValide(JSON.parse(JSON.stringify(etat)))).toBe(true);
    expect(nouveauQuiz().termineLe).toBeNull();
  });
  it.each([-1, 3.5, 999, NaN])('refuse une option inexistante %s', (choix) => {
    const etat = nouveauQuiz();
    expect(repondreQuiz(etat, choix)).toBe(etat);
  });
  it.each([null, {}, [], 'quiz', 20])('refuse un objet non conforme %j', (valeur) => expect(etatQuizValide(valeur)).toBe(false));
  it('refuse une ancienne banque, des indices et des résultats impossibles', () => {
    const etat = nouveauQuiz();
    const invalides = [
      { ...etat, version: 2 }, { ...etat, banque: etat.banque + 1 },
      { ...etat, index: -1 }, { ...etat, index: 14 },
      { ...etat, index: 3, reponses: [] }, { ...etat, reponses: [999] },
      { ...etat, reponses: ['1'] }, { ...etat, termineLe: '2026-09-05' },
      { ...etat, termineLe: '' }, { ...etat, termineLe: undefined },
    ];
    invalides.forEach((valeur) => expect(etatQuizValide(valeur)).toBe(false));
  });
  it('calcule le score depuis les réponses, pas un compteur stocké', () => {
    const etat = { ...repondreQuiz(nouveauQuiz(), (QUESTIONS[0]!.bonne + 1) % QUESTIONS[0]!.options.length), bonnes: 999 };
    expect(bonnesReponses(etat)).toBe(0);
  });
});
