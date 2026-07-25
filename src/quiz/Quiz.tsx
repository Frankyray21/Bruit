/**
 * Outils #23 et #24 — Quiz de validation et attestation.
 *
 * L'attestation est déclarative et générée sur l'appareil : elle ne constitue
 * pas un registre opposable. Si le comité SST exige une traçabilité formelle,
 * il faudra un serveur.
 */

import { useState } from 'react';
import { QUESTIONS } from './questions.js';
import { useStockage } from '../etat/stockage.js';
import { Avertissement, Carte } from '../ui/composants.js';

const SEUIL_REUSSITE = 0.8;

export function Quiz() {
  const [index, setIndex] = useState(0);
  const [choisi, setChoisi] = useState<number | null>(null);
  const [bonnes, setBonnes] = useState(0);
  const [termine, setTermine] = useState(false);
  const [nom, setNom] = useStockage('nom', '');

  const question = QUESTIONS[index];

  function repondre(i: number) {
    if (choisi !== null || !question) return;
    setChoisi(i);
    if (i === question.bonne) setBonnes(bonnes + 1);
  }

  function suivante() {
    setChoisi(null);
    if (index + 1 >= QUESTIONS.length) setTermine(true);
    else setIndex(index + 1);
  }

  function recommencer() {
    setIndex(0);
    setChoisi(null);
    setBonnes(0);
    setTermine(false);
  }

  if (termine) {
    const score = bonnes / QUESTIONS.length;
    const reussi = score >= SEUIL_REUSSITE;

    return (
      <Carte>
        <div className="attestation">
          <div className="attestation__score">{Math.round(score * 100)} %</div>
          <p>
            {bonnes} bonnes réponses sur {QUESTIONS.length}
          </p>
          <p style={{ marginTop: 12, fontWeight: 700 }}>
            {reussi ? 'Formation réussie' : 'Seuil de 80 % non atteint'}
          </p>

          {reussi && (
            <>
              <input
                className="choix__select"
                style={{ marginTop: 18, textAlign: 'center' }}
                placeholder="Ton nom, pour l'attestation"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
              {nom.trim() !== '' && (
                <p style={{ marginTop: 14 }}>
                  <strong>{nom}</strong>
                  <br />
                  Formation « Protection auditive » complétée le{' '}
                  {new Date().toLocaleDateString('fr-CA')}
                </p>
              )}
            </>
          )}
        </div>

        <div className="barre-boutons" style={{ marginTop: 16 }}>
          <button type="button" className="bouton" onClick={recommencer}>
            Refaire le quiz
          </button>
          {reussi && nom.trim() !== '' && (
            <button
              type="button"
              className="bouton bouton--secondaire"
              onClick={() => window.print()}
            >
              Imprimer
            </button>
          )}
        </div>

        <Avertissement>
          Cette attestation est <strong>générée sur ton appareil</strong> et
          repose sur une saisie déclarative. Elle ne constitue pas un registre
          de formation opposable. Vérifie avec ton comité SST ce qu'il exige.
        </Avertissement>
      </Carte>
    );
  }

  if (!question) return null;

  return (
    <Carte>
      <p className="quiz__progression">
        Question {index + 1} sur {QUESTIONS.length} · {bonnes} bonne
        {bonnes > 1 ? 's' : ''} réponse{bonnes > 1 ? 's' : ''} jusqu'ici
      </p>
      <p className="quiz__question">{question.enonce}</p>

      {question.options.map((option, i) => {
        let classe = 'quiz__option';
        if (choisi !== null) {
          if (i === question.bonne) classe += ' quiz__option--juste';
          else if (i === choisi) classe += ' quiz__option--faux';
        }
        return (
          <button
            key={i}
            type="button"
            className={classe}
            onClick={() => repondre(i)}
            disabled={choisi !== null}
          >
            {option}
          </button>
        );
      })}

      {choisi !== null && (
        <>
          <div className="declic">{question.explication}</div>
          <button type="button" className="bouton" onClick={suivante}>
            {index + 1 >= QUESTIONS.length ? 'Voir mon résultat' : 'Question suivante'}
          </button>
        </>
      )}
    </Carte>
  );
}
