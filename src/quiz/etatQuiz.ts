import { QUESTIONS } from './questions.js';

export const SEUIL_REUSSITE = 0.8;
const signature = JSON.stringify(QUESTIONS).split('').reduce((hash, caractere) => Math.imul(hash ^ caractere.charCodeAt(0), 16777619), 2166136261) >>> 0;
export interface EtatQuiz {
  version: 1;
  banque: number;
  index: number;
  reponses: number[];
  termineLe: string | null;
}
export function nouveauQuiz(): EtatQuiz {
  return { version: 1, banque: signature, index: 0, reponses: [], termineLe: null };
}
export function etatQuizValide(valeur: unknown): valeur is EtatQuiz {
  if (!valeur || typeof valeur !== 'object') return false;
  const etat = valeur as Partial<EtatQuiz>;
  if (etat.version !== 1 || etat.banque !== signature || !Number.isInteger(etat.index)) return false;
  const index = etat.index as number;
  if (index < 0 || index >= QUESTIONS.length || !Array.isArray(etat.reponses)) return false;
  if (etat.reponses.length !== index && etat.reponses.length !== index + 1) return false;
  if (!etat.reponses.every((reponse, i) => Number.isInteger(reponse) && reponse >= 0 && reponse < QUESTIONS[i]!.options.length)) return false;
  if (etat.termineLe === null) return true;
  return typeof etat.termineLe === 'string' && Number.isFinite(Date.parse(etat.termineLe)) &&
    index === QUESTIONS.length - 1 && etat.reponses.length === QUESTIONS.length;
}
export function repondreQuiz(etat: EtatQuiz, choix: number): EtatQuiz {
  if (etat.termineLe || etat.reponses.length > etat.index || !Number.isInteger(choix) || choix < 0 || choix >= QUESTIONS[etat.index]!.options.length) return etat;
  return { ...etat, reponses: [...etat.reponses, choix] };
}
export function avancerQuiz(etat: EtatQuiz, maintenant = new Date().toISOString()): EtatQuiz {
  if (etat.termineLe || etat.reponses.length <= etat.index) return etat;
  return etat.index + 1 === QUESTIONS.length ? { ...etat, termineLe: maintenant } : { ...etat, index: etat.index + 1 };
}
export function bonnesReponses(etat: EtatQuiz): number {
  return etat.reponses.filter((reponse, index) => reponse === QUESTIONS[index]!.bonne).length;
}
