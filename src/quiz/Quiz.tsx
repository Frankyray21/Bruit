/**
 * Outils #23 et #24 — Quiz de validation et attestation.
 *
 * L'état du quiz est mémorisé sur l'appareil : changer d'onglet pour vérifier
 * une valeur, ou se faire recharger par une mise à jour, ne renvoie plus à la
 * question 1. Le résultat est conservé avec sa date, et chaque erreur renvoie
 * au module à revoir.
 *
 * L'attestation est déclarative et générée sur l'appareil : elle ne constitue
 * pas un registre opposable. Si le comité SST exige une traçabilité formelle,
 * il faudra un serveur.
 */

import { useEffect, useRef } from 'react';
import { QUESTIONS, type Question } from './questions.js';
import { MODULES } from '../parcours/modules.js';
import { useStockage } from '../etat/stockage.js';
import { useTravailleur, type ResultatQuiz } from '../etat/travailleur.js';
import { Avertissement, Carte } from '../ui/composants.js';

export const SEUIL_REUSSITE = 0.8;

/** Nombre de bonnes réponses requis pour réussir. 80 % de 14, c'est 12. */
export const BONNES_REQUISES = Math.ceil(SEUIL_REUSSITE * QUESTIONS.length);

interface EtatQuiz {
  readonly index: number;
  /** Réponse choisie pour chaque question (index de l'option), `null` si pas encore répondu. */
  readonly reponses: readonly (number | null)[];
  readonly termine: boolean;
}

const ETAT_INITIAL: EtatQuiz = {
  index: 0,
  reponses: QUESTIONS.map(() => null),
  termine: false,
};

export function formaterDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function pluriel(n: number, un: string, plusieurs: string): string {
  return `${n} ${n > 1 ? plusieurs : un}`;
}

function titreModule(id: string): string {
  return MODULES.find((m) => m.id === id)?.titre ?? id;
}

/** Une option de réponse, colorée une fois la question répondue. */
export function OptionQuestion({
  question,
  i,
  choisi,
  onChoisir,
}: {
  question: Question;
  i: number;
  choisi: number | null;
  onChoisir: (i: number) => void;
}) {
  let classe = 'quiz__option';
  if (choisi !== null) {
    if (i === question.bonne) classe += ' quiz__option--juste';
    else if (i === choisi) classe += ' quiz__option--faux';
  }
  const option = question.options[i]!;
  return (
    <button
      type="button"
      className={classe}
      onClick={() => onChoisir(i)}
      disabled={choisi !== null}
      aria-pressed={choisi === i}
    >
      <span className="quiz__lettre" aria-hidden="true">
        {String.fromCharCode(65 + i)}
      </span>
      {option}
    </button>
  );
}

export function Quiz({
  onRevoir,
  onFormation,
}: {
  /** Ouvre un module à revoir. */
  onRevoir: (moduleId: string) => void;
  /** Retourne à la liste des modules. */
  onFormation: () => void;
}) {
  const { profil, majProfil, faits, resultatQuiz, setResultatQuiz } = useTravailleur();
  const [etat, setEtat] = useStockage<EtatQuiz>('quiz-etat', ETAT_INITIAL);
  const refQuestion = useRef<HTMLParagraphElement>(null);

  // Une ancienne sauvegarde avec un nombre de questions différent serait
  // incohérente : on repart proprement.
  const reponses =
    etat.reponses.length === QUESTIONS.length ? etat.reponses : ETAT_INITIAL.reponses;
  const index = Math.min(etat.index, QUESTIONS.length - 1);
  const question = QUESTIONS[index]!;
  const choisi = reponses[index] ?? null;
  const bonnes = reponses.filter((r, i) => r !== null && r === QUESTIONS[i]!.bonne).length;

  // Après « Question suivante », le focus va sur la nouvelle question : au
  // clavier ou au lecteur d'écran, on ne reste pas sur un bouton disparu.
  useEffect(() => {
    if (!etat.termine) refQuestion.current?.focus();
  }, [index, etat.termine]);

  function repondre(i: number) {
    if (choisi !== null) return;
    setEtat({
      ...etat,
      reponses: reponses.map((r, j) => (j === index ? i : r)),
    });
  }

  function suivante() {
    if (index + 1 >= QUESTIONS.length) {
      const modulesRates = [
        ...new Set(QUESTIONS.filter((q, i) => reponses[i] !== q.bonne).map((q) => q.module)),
      ];
      const resultat: ResultatQuiz = {
        bonnes,
        total: QUESTIONS.length,
        reussi: bonnes >= BONNES_REQUISES,
        date: new Date().toISOString(),
        modulesRates,
      };
      setResultatQuiz(resultat);
      setEtat({ ...etat, reponses, termine: true });
    } else {
      setEtat({ ...etat, reponses, index: index + 1 });
    }
  }

  function recommencer() {
    setEtat(ETAT_INITIAL);
  }

  if (etat.termine && resultatQuiz) {
    return (
      <Resultat
        resultat={resultatQuiz}
        reponses={reponses}
        nom={profil.nom}
        onNom={(nom) => majProfil({ nom })}
        modulesFaits={faits.length}
        onRecommencer={recommencer}
        onRevoir={onRevoir}
      />
    );
  }

  const suivanteEstDerniere = index + 1 >= QUESTIONS.length;

  return (
    <>
      {index === 0 && choisi === null && (
        <Carte titre="Le quiz" source="14 questions">
          <p className="carte__intro" style={{ marginBottom: 0 }}>
            Une question à la fois, avec l'explication après chaque réponse. Il
            faut <strong>{BONNES_REQUISES} bonnes réponses sur {QUESTIONS.length}</strong>{' '}
            pour obtenir l'attestation. Tu peux quitter et revenir : ta place est
            gardée.
          </p>
          {faits.length < MODULES.length && (
            <p className="carte__intro" style={{ marginTop: 10, marginBottom: 0 }}>
              Tu as fait {faits.length} module{faits.length > 1 ? 's' : ''} sur{' '}
              {MODULES.length}.{' '}
              <button type="button" className="lien" onClick={onFormation}>
                Finir la formation d'abord
              </button>
            </p>
          )}
        </Carte>
      )}

      <Carte>
        <div
          className="quiz__barre"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={index}
          aria-label="Avancement du quiz"
        >
          <span style={{ width: `${(index / QUESTIONS.length) * 100}%` }} />
        </div>
        <p className="quiz__progression">
          Question {index + 1} sur {QUESTIONS.length} ·{' '}
          {pluriel(bonnes, 'bonne réponse', 'bonnes réponses')} jusqu'ici
        </p>
        <p className="quiz__question" ref={refQuestion} tabIndex={-1}>
          {question.enonce}
        </p>

        {question.options.map((_, i) => (
          <OptionQuestion key={i} question={question} i={i} choisi={choisi} onChoisir={repondre} />
        ))}

        {choisi !== null && (
          <>
            <div className="declic" role="status">
              <strong>{choisi === question.bonne ? 'Bonne réponse. ' : 'Pas tout à fait. '}</strong>
              {question.explication}
            </div>
            <button type="button" className="bouton" onClick={suivante}>
              {suivanteEstDerniere ? 'Voir mon résultat' : 'Question suivante'}
            </button>
          </>
        )}
      </Carte>
    </>
  );
}

function Resultat({
  resultat,
  reponses,
  nom,
  onNom,
  modulesFaits,
  onRecommencer,
  onRevoir,
}: {
  resultat: ResultatQuiz;
  reponses: readonly (number | null)[];
  nom: string;
  onNom: (nom: string) => void;
  modulesFaits: number;
  onRecommencer: () => void;
  onRevoir: (moduleId: string) => void;
}) {
  const { bonnes, total, reussi } = resultat;
  const score = Math.round((bonnes / total) * 100);
  const ratees = QUESTIONS.map((q, i) => ({ q, i, choisi: reponses[i] ?? null })).filter(
    ({ q, choisi }) => choisi !== q.bonne,
  );

  return (
    <>
      <Carte>
        <div className={`attestation${reussi ? '' : ' attestation--echec'}`}>
          <p className="attestation__kicker">
            {reussi ? 'Attestation de formation' : 'Résultat du quiz'}
          </p>
          <div className="attestation__score">{score} %</div>
          <p>
            {pluriel(bonnes, 'bonne réponse', 'bonnes réponses')} sur {total}
          </p>
          <p style={{ marginTop: 12, fontWeight: 700 }}>
            {reussi
              ? 'Formation réussie'
              : `Il faut ${BONNES_REQUISES} bonnes réponses — il t'en manque ${BONNES_REQUISES - bonnes}`}
          </p>

          {reussi && (
            <>
              <input
                className="choix__select"
                style={{ marginTop: 18, textAlign: 'center' }}
                aria-label="Ton nom, pour l'attestation"
                placeholder="Ton nom, pour l'attestation"
                autoComplete="name"
                value={nom}
                onChange={(e) => onNom(e.target.value)}
              />
              <div className="attestation__texte">
                {nom.trim() !== '' && (
                  <p>
                    <strong>{nom}</strong>
                  </p>
                )}
                <p>
                  Formation « Protection auditive » — Machines Roger International
                  <br />
                  complétée le <strong>{formaterDate(resultat.date)}</strong>
                </p>
                <p className="attestation__detail">
                  Quiz : {bonnes} / {total} · Modules suivis : {modulesFaits} / {MODULES.length}
                </p>
              </div>
            </>
          )}
        </div>

        {!reussi && resultat.modulesRates.length > 0 && (
          <div className="a-revoir">
            <p className="champ__etiquette">À revoir avant de réessayer</p>
            {resultat.modulesRates.map((id) => (
              <button
                key={id}
                type="button"
                className="bouton bouton--secondaire"
                onClick={() => onRevoir(id)}
              >
                Revoir « {titreModule(id)} »
              </button>
            ))}
          </div>
        )}

        <div className="barre-boutons" style={{ marginTop: 16 }}>
          <button
            type="button"
            className={`bouton${reussi ? ' bouton--secondaire' : ''}`}
            onClick={onRecommencer}
          >
            Refaire le quiz
          </button>
          {reussi && nom.trim() !== '' && (
            <button type="button" className="bouton" onClick={() => window.print()}>
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

      {ratees.length > 0 && (
        <Carte titre="Mes erreurs" source={pluriel(ratees.length, 'question', 'questions')}>
          <p className="carte__intro">
            La bonne réponse est en vert, la tienne en rouge. Chaque explication
            renvoie à la diapo de la formation.
          </p>
          {ratees.map(({ q, i, choisi }) => (
            <details key={i} className="relecture">
              <summary>
                <span className="relecture__num">{i + 1}</span>
                {q.enonce}
              </summary>
              {q.options.map((_, j) => (
                <OptionQuestion key={j} question={q} i={j} choisi={choisi} onChoisir={() => {}} />
              ))}
              <div className="declic">{q.explication}</div>
              <button
                type="button"
                className="bouton bouton--secondaire"
                onClick={() => onRevoir(q.module)}
              >
                Revoir « {titreModule(q.module)} »
              </button>
            </details>
          ))}
        </Carte>
      )}
    </>
  );
}
