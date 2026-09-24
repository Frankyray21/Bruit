/**
 * Ce que le site sait du travailleur — et rien de plus.
 *
 * Un profil (nom, poste, protecteur) choisi une seule fois et repris par tous
 * les calculateurs : « Mon poste » n'est plus demandé cinq fois avec cinq
 * valeurs par défaut différentes. Une progression (modules faits, questions
 * de validation, résultat du quiz) pour reprendre où on était et prouver ce
 * qui a été fait. Tout reste dans le téléphone.
 */

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import {
  metierParId,
  metiers,
  protecteurParId,
  protecteurs,
  type Metier,
  type Protecteur,
} from '../data/index.js';
import { lire, PREFIXE, useStockage } from './stockage.js';

export interface Profil {
  readonly nom: string;
  /** `null` tant que le travailleur n'a pas choisi : les outils prennent alors un poste type. */
  readonly posteId: string | null;
  readonly protecteurId: string | null;
}

export interface ResultatQuiz {
  readonly bonnes: number;
  readonly total: number;
  readonly reussi: boolean;
  /** Date ISO de la fin du quiz — c'est celle qui figure sur l'attestation. */
  readonly date: string;
  /** Identifiants des modules dont au moins une question a été ratée. */
  readonly modulesRates: readonly string[];
  /**
   * Modules terminés au moment où le quiz a été fini : c'est ce que dit
   * l'attestation, figé à sa date. Absent des résultats enregistrés avant que
   * ce champ existe.
   */
  readonly modulesFaits?: number;
}

/** Poste et protecteur types, quand le travailleur n'a encore rien choisi. */
export const POSTE_PAR_DEFAUT = 'foreur-long-trou';
export const PROTECTEUR_PAR_DEFAUT = 'howard-leight-max';

interface Travailleur {
  readonly profil: Profil;
  readonly majProfil: (changement: Partial<Profil>) => void;
  /** Le poste retenu par les calculateurs (celui du profil, sinon le poste type). */
  readonly poste: Metier;
  readonly protecteur: Protecteur;
  /** `true` si le poste vient du profil et non du repli. */
  readonly posteChoisi: boolean;
  readonly protecteurChoisi: boolean;

  readonly faits: readonly string[];
  readonly marquerFait: (moduleId: string) => void;
  /** Question de validation de fin de module : `true` = bonne réponse. */
  readonly validations: Readonly<Record<string, boolean>>;
  readonly validerModule: (moduleId: string, reussi: boolean) => void;
  readonly reinitialiserProgression: () => void;

  readonly resultatQuiz: ResultatQuiz | null;
  readonly setResultatQuiz: (resultat: ResultatQuiz | null) => void;
}

const Contexte = createContext<Travailleur | null>(null);

export function FournisseurTravailleur({ children }: { children: ReactNode }) {
  const [profil, setProfil] = useStockage<Profil>('profil', {
    // Reprise du nom saisi dans une version précédente du site.
    nom: lire('nom', ''),
    posteId: null,
    protecteurId: null,
  });
  const [faits, setFaits] = useStockage<string[]>('modules-faits', []);
  const [validations, setValidations] = useStockage<Record<string, boolean>>(
    'validations',
    {},
  );
  const [resultatQuiz, setResultatQuiz] = useStockage<ResultatQuiz | null>(
    'quiz-resultat',
    null,
  );

  const majProfil = useCallback(
    (changement: Partial<Profil>) =>
      setProfil((precedent) => ({ ...precedent, ...changement })),
    [setProfil],
  );

  const marquerFait = useCallback(
    (id: string) => setFaits((precedent) => [...new Set([...precedent, id])]),
    [setFaits],
  );

  const validerModule = useCallback(
    (id: string, reussi: boolean) =>
      setValidations((precedent) => ({ ...precedent, [id]: reussi })),
    [setValidations],
  );

  const reinitialiserProgression = useCallback(() => {
    setFaits([]);
    setValidations({});
    setResultatQuiz(null);
    // Le quiz en cours (ou terminé) repart de zéro lui aussi : il vit dans
    // son propre composant, démonté à ce moment-là.
    try {
      localStorage.removeItem(`${PREFIXE}quiz-etat`);
    } catch {
      // Stockage inaccessible : le quiz se réinitialisera de lui-même
      // (terminé sans résultat = état invalide).
    }
  }, [setFaits, setValidations, setResultatQuiz]);

  const valeur = useMemo<Travailleur>(() => {
    const posteProfil = profil.posteId ? metierParId(profil.posteId) : undefined;
    const protecteurProfil = profil.protecteurId
      ? protecteurParId(profil.protecteurId)
      : undefined;
    return {
      profil,
      majProfil,
      poste: posteProfil ?? metierParId(POSTE_PAR_DEFAUT) ?? metiers[0]!,
      protecteur:
        protecteurProfil ?? protecteurParId(PROTECTEUR_PAR_DEFAUT) ?? protecteurs[0]!,
      posteChoisi: posteProfil !== undefined,
      protecteurChoisi: protecteurProfil !== undefined,
      faits,
      marquerFait,
      validations,
      validerModule,
      reinitialiserProgression,
      resultatQuiz,
      setResultatQuiz,
    };
  }, [
    profil,
    majProfil,
    faits,
    marquerFait,
    validations,
    validerModule,
    reinitialiserProgression,
    resultatQuiz,
    setResultatQuiz,
  ]);

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useTravailleur(): Travailleur {
  const t = useContext(Contexte);
  if (!t) throw new Error('useTravailleur hors du FournisseurTravailleur');
  return t;
}
