/**
 * La question de validation qui ferme chaque module.
 *
 * Une seule question, tirée de la banque du quiz, avec son explication : le
 * bouton « J'ai terminé » ne s'active qu'une fois qu'on y a répondu. Bonne ou
 * mauvaise réponse, on peut continuer — c'est l'explication qui enseigne — mais
 * le résultat est mémorisé, et il compte dans « Ma progression ».
 */

import { QUESTIONS } from '../quiz/questions.js';
import { OptionQuestion } from '../quiz/Quiz.js';
import { useTravailleur } from '../etat/travailleur.js';
import { Carte } from '../ui/composants.js';
import type { Module } from './modules.js';

export function questionDuModule(moduleId: string) {
  return QUESTIONS.find((q) => q.module === moduleId);
}

export function ValidationModule({ module }: { module: Module }) {
  const { validations, validerModule } = useTravailleur();
  const question = questionDuModule(module.id);
  if (!question) return null;

  const deja = validations[module.id];
  // Une fois validée, on remontre la bonne réponse (le choix exact n'est pas
  // conservé : seule compte la trace « répondu, juste ou non »).
  const choisi = deja === undefined ? null : deja ? question.bonne : -1;

  return (
    <Carte titre="Avant de terminer" source="question de validation">
      <p className="quiz__question">{question.enonce}</p>
      {question.options.map((_, i) => (
        <OptionQuestion
          key={i}
          question={question}
          i={i}
          choisi={choisi}
          onChoisir={(i) => validerModule(module.id, i === question.bonne)}
        />
      ))}
      {deja !== undefined && (
        <div className="declic" role="status">
          <strong>{deja ? 'Bonne réponse. ' : 'La bonne réponse est en vert. '}</strong>
          {question.explication}
        </div>
      )}
    </Carte>
  );
}
