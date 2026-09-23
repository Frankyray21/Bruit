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

import { useEffect, useRef, useState } from 'react';
import { QUESTIONS, type Question } from './questions.js';
import { MODULES } from '../parcours/modules.js';
import { useStockage } from '../etat/stockage.js';
import { useTravailleur, type ResultatQuiz } from '../etat/travailleur.js';
import { Avertissement, Carte } from '../ui/composants.js';

export const SEUIL_REUSSITE = 0.8;

/** Nombre de bonnes réponses requis pour réussir. 80 % de 14, c'est 12. */
export const BONNES_REQUISES = Math.ceil(SEUIL_REUSSITE * QUESTIONS.length);

interface EtatQuiz {
  /** Position courante dans `ordre` (0 = première question posée). */
  readonly index: number;
  /**
   * Ordre de passage : `ordre[position]` = index de la question dans la
   * banque. Tiré au sort à chaque tentative, pour que le quiz ne s'apprenne
   * pas par cœur ; conservé avec l'état pour survivre à un rechargement.
   */
  readonly ordre: readonly number[];
  /** Réponse choisie par question de la banque (index de l'option), `null` si pas répondu. */
  readonly reponses: readonly (number | null)[];
  readonly termine: boolean;
}

/** Une permutation des indices de la banque (Fisher-Yates). */
function tirerOrdre(): number[] {
  const ordre = QUESTIONS.map((_, i) => i);
  for (let i = ordre.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordre[i], ordre[j]] = [ordre[j]!, ordre[i]!];
  }
  return ordre;
}

function etatInitial(): EtatQuiz {
  return {
    index: 0,
    ordre: tirerOrdre(),
    reponses: QUESTIONS.map(() => null),
    termine: false,
  };
}

function ordreValide(ordre: readonly number[] | undefined): boolean {
  return (
    Array.isArray(ordre) &&
    ordre.length === QUESTIONS.length &&
    new Set(ordre).size === QUESTIONS.length &&
    ordre.every((i) => Number.isInteger(i) && i >= 0 && i < QUESTIONS.length)
  );
}

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
  provisoire = null,
  onChoisir,
}: {
  question: Question;
  i: number;
  choisi: number | null;
  /** Choix retenu mais pas encore révélé (projection). */
  provisoire?: number | null;
  onChoisir: (i: number) => void;
}) {
  const repondu = choisi !== null;
  const juste = repondu && i === question.bonne;
  const faux = repondu && i === choisi && i !== question.bonne;
  let classe = 'quiz__option';
  if (juste) classe += ' quiz__option--juste';
  else if (faux) classe += ' quiz__option--faux';
  else if (!repondu && provisoire === i) classe += ' quiz__option--provisoire';
  const option = question.options[i]!;
  // Le badge dit l'état sans la couleur : ✓ bonne réponse, ✕ ta réponse.
  const badge = juste ? '✓' : faux ? '✕' : String.fromCharCode(65 + i);
  return (
    <button
      type="button"
      className={classe}
      onClick={() => onChoisir(i)}
      disabled={repondu}
      aria-pressed={repondu ? choisi === i : provisoire === i}
    >
      <span className="quiz__lettre" aria-hidden="true">
        {badge}
      </span>
      <span>
        {option}
        {juste && <span className="sr-only"> — bonne réponse</span>}
        {faux && <span className="sr-only"> — ta réponse, fausse</span>}
      </span>
    </button>
  );
}

export function Quiz({
  onRevoir,
  onFormation,
  revelation = false,
}: {
  /** Ouvre un module à revoir. */
  onRevoir: (moduleId: string) => void;
  /** Retourne à la liste des modules. */
  onFormation: () => void;
  /**
   * En projection : le premier appui ne fait que retenir un choix, un bouton
   * « Révéler » dévoile la réponse — le formateur peut faire voter la salle.
   */
  revelation?: boolean;
}) {
  const { profil, majProfil, faits, resultatQuiz, setResultatQuiz } = useTravailleur();
  const [etatBrut, setEtat] = useStockage<EtatQuiz>('quiz-etat', etatInitial);
  const [provisoire, setProvisoire] = useState<number | null>(null);
  const refQuestion = useRef<HTMLParagraphElement>(null);

  // Une sauvegarde d'une version précédente (sans ordre, ou avec un autre
  // nombre de questions) serait incohérente : on repart proprement.
  const etat: EtatQuiz =
    etatBrut.reponses.length === QUESTIONS.length && ordreValide(etatBrut.ordre)
      ? etatBrut
      : etatInitial();
  const { reponses, ordre } = etat;
  const index = Math.min(etat.index, QUESTIONS.length - 1);
  const numero = ordre[index]!;
  const question = QUESTIONS[numero]!;
  const choisi = reponses[numero] ?? null;
  const bonnes = reponses.filter((r, i) => r !== null && r === QUESTIONS[i]!.bonne).length;

  // Après « Question suivante », le focus va sur la nouvelle question : au
  // clavier ou au lecteur d'écran, on ne reste pas sur un bouton disparu.
  useEffect(() => {
    if (!etat.termine) refQuestion.current?.focus();
    setProvisoire(null);
  }, [index, etat.termine]);

  function repondre(i: number) {
    if (choisi !== null) return;
    if (revelation && provisoire === null) {
      setProvisoire(i);
      return;
    }
    setEtat({
      ...etat,
      reponses: reponses.map((r, j) => (j === numero ? i : r)),
    });
    setProvisoire(null);
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
      setEtat({ ...etat, termine: true });
    } else {
      setEtat({ ...etat, index: index + 1 });
    }
  }

  function recommencer() {
    setEtat(etatInitial());
  }

  if (etat.termine && resultatQuiz) {
    return (
      <Resultat
        resultat={resultatQuiz}
        reponses={reponses}
        ordre={ordre}
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
          <OptionQuestion
            key={i}
            question={question}
            i={i}
            choisi={choisi}
            provisoire={provisoire}
            onChoisir={repondre}
          />
        ))}

        {revelation && choisi === null && provisoire !== null && (
          <button type="button" className="bouton" onClick={() => repondre(provisoire)}>
            Révéler la réponse
          </button>
        )}

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
  ordre,
  nom,
  onNom,
  modulesFaits,
  onRecommencer,
  onRevoir,
}: {
  resultat: ResultatQuiz;
  reponses: readonly (number | null)[];
  ordre: readonly number[];
  nom: string;
  onNom: (nom: string) => void;
  modulesFaits: number;
  onRecommencer: () => void;
  onRevoir: (moduleId: string) => void;
}) {
  const { bonnes, total, reussi } = resultat;
  const score = Math.round((bonnes / total) * 100);
  // Dans l'ordre où les questions ont été posées, numérotées ainsi.
  const ratees = ordre
    .map((numero, position) => ({
      q: QUESTIONS[numero]!,
      i: position,
      choisi: reponses[numero] ?? null,
    }))
    .filter(({ q, choisi }) => choisi !== q.bonne);

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
          Cette attestation est <strong>générée sur ton appareil</strong>, à
          partir de ce que tu as déclaré. Garde-la : c'est ton employeur et le
          comité SST qui tiennent le registre officiel de formation, et ils
          peuvent te demander de la présenter.
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
