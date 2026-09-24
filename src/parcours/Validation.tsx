/**
 * La question de validation qui ferme chaque module.
 *
 * Une seule question, tirée de la banque du quiz, avec son explication : le
 * bouton « J'ai terminé » ne s'active qu'une fois qu'on y a répondu. Bonne ou
 * mauvaise réponse, on peut continuer — c'est l'explication qui enseigne — mais
 * le résultat est mémorisé, et il compte dans « Ma progression ».
 */

import { QUESTIONS } from '../quiz/questions.js';
import { ListeReponses, OptionQuestion } from '../quiz/Quiz.js';
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
    <Carte
      titre="Avant d'aller plus loin"
      source="question de validation"
      classe={`carte--validation${deja !== undefined ? ' carte--validation-faite' : ''}`}
    >
      <p className="validation__etat" role="status">
        <span className={`validation__pastille${deja !== undefined ? ' validation__pastille--fait' : ''}`}>
          {deja === undefined ? 'À faire pour terminer le module' : deja ? 'Fait ✓ — bonne réponse' : 'Fait ✓ — à retenir'}
        </span>
      </p>
      <p className="carte__intro">
        Une question pour vérifier que l'essentiel est passé. Le bouton
        « Terminé » s'active dès que tu as répondu — bonne ou mauvaise réponse,
        l'explication suit.
      </p>
      <p className="quiz__question">{question.enonce}</p>
      <ListeReponses consigne={deja === undefined ? 'Touche ta réponse' : undefined}>
        {question.options.map((_, i) => (
          <OptionQuestion
            key={i}
            question={question}
            i={i}
            choisi={choisi}
            onChoisir={(i) => validerModule(module.id, i === question.bonne)}
          />
        ))}
      </ListeReponses>
      {deja !== undefined && (
        <div className="declic" role="status">
          <strong>{deja ? 'Bonne réponse. ' : 'La bonne réponse est en vert. '}</strong>
          {question.explication}
        </div>
      )}
    </Carte>
  );
}
