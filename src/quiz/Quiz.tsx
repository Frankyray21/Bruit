/** Quiz et attestation locale. Questions, réponses et seuil conservés. */
import { useEffect, useRef } from 'react';
import { QUESTIONS } from './questions.js';
import { avancerQuiz, bonnesReponses, etatQuizValide, nouveauQuiz, repondreQuiz, SEUIL_REUSSITE } from './etatQuiz.js';
import { useStockage } from '../etat/stockage.js';
import { Avertissement, Carte } from '../ui/composants.js';

const QUIZ_VIDE = nouveauQuiz();
export function Quiz() {
  const [etat, setEtat] = useStockage('quiz-v1', QUIZ_VIDE, etatQuizValide);
  const [nom, setNom] = useStockage('nom', '');
  const titre = useRef<HTMLHeadingElement>(null);
  const retour = useRef<HTMLDivElement>(null);
  const question = QUESTIONS[etat.index]!;
  const choisi = etat.reponses[etat.index] ?? null;
  const bonnes = bonnesReponses(etat);
  const score = bonnes / QUESTIONS.length;
  const reussi = score >= SEUIL_REUSSITE;
  useEffect(() => { if (choisi === null || etat.termineLe) titre.current?.focus({ preventScroll: true }); }, [etat.index, etat.termineLe, choisi]);
  useEffect(() => { if (choisi !== null && !etat.termineLe) retour.current?.focus(); }, [choisi, etat.termineLe]);
  function recommencer() {
    if (window.confirm('Effacer les réponses de ce quiz et recommencer ?')) setEtat(nouveauQuiz());
  }
  if (etat.termineLe) return (
    <>
      <h1 ref={titre} tabIndex={-1}>Résultat du quiz</h1>
      <Carte>
        <div className="attestation">
          <div className="attestation__score">{Math.round(score * 100)} %</div>
          <p>{bonnes} bonnes réponses sur {QUESTIONS.length}</p>
          <h2>{reussi ? 'Formation réussie' : 'Seuil de 80 % non atteint'}</h2>
          <p>Quiz terminé le {new Date(etat.termineLe).toLocaleDateString('fr-CA')}.</p>
          {reussi && <>
            <label htmlFor="quiz-nom">Ton nom pour l'attestation</label>
            <input id="quiz-nom" className="choix__select" autoComplete="name" value={nom} onChange={(evt) => setNom(evt.target.value)} />
            {nom.trim() && <p><strong>{nom}</strong><br />Formation « Protection auditive » complétée le {new Date(etat.termineLe).toLocaleDateString('fr-CA')}.</p>}
          </>}
        </div>
        <div className="barre-boutons" style={{ marginTop: 16 }}>
          <button type="button" className="bouton bouton--secondaire" onClick={recommencer}>Refaire le quiz</button>
          {reussi && nom.trim() && <button type="button" className="bouton" onClick={() => window.print()}>Imprimer l'attestation</button>}
        </div>
        <Avertissement>Cette attestation est <strong>générée sur ton appareil</strong> et repose sur une saisie déclarative. Elle ne constitue pas un registre de formation opposable. Vérifie avec ton comité SST ce qu'il exige.</Avertissement>
      </Carte>
    </>
  );
  return (
    <>
      <h1>Quiz de validation</h1>
      <p className="carte__intro">{QUESTIONS.length} questions. Seuil de réussite : 80 %. Choisis une réponse, puis lis l'explication.</p>
      <p className="carte__source">Reprise automatique sur cet appareil si le stockage est disponible.</p>
      <Carte>
        <p className="quiz__progression">Question {etat.index + 1} sur {QUESTIONS.length}</p>
        <progress max={QUESTIONS.length} value={etat.index} aria-label="Questions terminées" />
        <h2 className="quiz__question" ref={titre} tabIndex={-1}>{question.enonce}</h2>
        {question.options.map((option, i) => {
          let classe = 'quiz__option';
          if (choisi !== null) {
            if (i === question.bonne) classe += ' quiz__option--juste';
            else if (i === choisi) classe += ' quiz__option--faux';
          }
          return <button key={i} type="button" className={classe} disabled={choisi !== null} onClick={() => setEtat((precedent) => repondreQuiz(precedent, i))}>
            {choisi !== null && i === question.bonne ? '✓ ' : choisi === i ? '✕ ' : ''}{option}
          </button>;
        })}
        {choisi !== null && <>
          <div className="declic" role="status" ref={retour} tabIndex={-1}>
            <strong>{choisi === question.bonne ? 'Bonne réponse. ' : 'À revoir. '}</strong>{question.explication}
          </div>
          <button type="button" className="bouton" onClick={() => setEtat((precedent) => avancerQuiz(precedent))}>
            {etat.index + 1 === QUESTIONS.length ? 'Voir mon résultat' : 'Question suivante'}
          </button>
        </>}
        {etat.reponses.length > 0 && <button type="button" className="bouton bouton--secondaire" style={{ marginTop: 12 }} onClick={recommencer}>Recommencer le quiz</button>}
      </Carte>
    </>
  );
}
