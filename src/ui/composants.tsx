/**
 * Composants « terrain » : gros contrôles, contrastes forts, aucune saisie de
 * texte libre dans le parcours principal.
 */

import { Component, createContext, useContext, useId, type ErrorInfo, type ReactNode } from 'react';
import type { NiveauVerdict } from '../domain/verdict.js';

/**
 * Une partie de l'écran qui plante (3D, vidéo, un calcul sur une donnée
 * inattendue) ne doit pas emporter tout le site : on affiche un repli à sa
 * place, et le reste continue de fonctionner.
 */
export class FrontiereErreur extends Component<
  { children: ReactNode; quoi?: string },
  { erreur: boolean }
> {
  override state = { erreur: false };

  static getDerivedStateFromError() {
    return { erreur: true };
  }

  override componentDidCatch(erreur: unknown, info: ErrorInfo) {
    console.error(erreur, info.componentStack);
  }

  override render() {
    if (!this.state.erreur) return this.props.children;
    return (
      <Carte titre="Cette partie n'a pas pu s'afficher">
        <Avertissement>
          Un imprévu a bloqué l'affichage {this.props.quoi ?? 'de cette section'}.
          Le reste du site fonctionne normalement.
        </Avertissement>
        <button
          type="button"
          className="bouton bouton--secondaire"
          onClick={() => this.setState({ erreur: false })}
        >
          Réessayer
        </button>
      </Carte>
    );
  }
}

export function Carte({
  titre,
  source,
  intro,
  cache = false,
  classe,
  children,
}: {
  titre?: string;
  source?: string;
  intro?: string;
  /** Carte montée mais invisible (ex. : le temps qu'un modèle 3D se charge). */
  cache?: boolean;
  /** Variante visuelle (ex. « carte--validation »). */
  classe?: string;
  children: ReactNode;
}) {
  return (
    <section className={`carte${classe ? ` ${classe}` : ''}`} hidden={cache}>
      {titre && (
        <div className="carte__titre">
          <h2>{titre}</h2>
          {source && <span className="carte__source">{source}</span>}
        </div>
      )}
      {intro && <p className="carte__intro">{intro}</p>}
      {children}
    </section>
  );
}

/**
 * Un champ et son étiquette.
 *
 * Chaque contrôle reçoit l'identifiant de l'étiquette via le contexte :
 * nommer le groupe seul ne nomme pas les sélecteurs et curseurs qu'il contient.
 */
const EtiquetteChamp = createContext<string | undefined>(undefined);

export function Champ({
  etiquette,
  children,
}: {
  etiquette: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="champ" role="group" aria-labelledby={id}>
      <span className="champ__etiquette" id={id}>
        {etiquette}
      </span>
      <EtiquetteChamp.Provider value={id}>{children}</EtiquetteChamp.Provider>
    </div>
  );
}

export function Choix<T extends string>({
  options,
  valeur,
  onChange,
}: {
  options: readonly { readonly id: T; readonly nom: string }[];
  valeur: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="choix">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`choix__option${o.id === valeur ? ' choix__option--actif' : ''}`}
          aria-pressed={o.id === valeur}
          onClick={() => onChange(o.id)}
        >
          {o.nom}
        </button>
      ))}
    </div>
  );
}

export function Selecteur<T extends { id: string; nom: string }>({
  options,
  valeur,
  onChange,
  format,
  etiquette,
}: {
  options: readonly T[];
  valeur: string;
  onChange: (id: string) => void;
  format?: (option: T) => string;
  /** Étiquette pour le lecteur d'écran quand le champ n'en a pas de visible. */
  etiquette?: string;
}) {
  const etiquetteChamp = useContext(EtiquetteChamp);
  return (
    <select
      className="choix__select"
      value={valeur}
      aria-label={etiquette ?? (etiquetteChamp ? undefined : 'Choisir une option')}
      aria-labelledby={etiquette ? undefined : etiquetteChamp}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {format ? format(o) : o.nom}
        </option>
      ))}
    </select>
  );
}

export function Curseur({
  min,
  max,
  pas,
  valeur,
  onChange,
  affichage,
  legende,
  etiquette,
  valeursRapides,
}: {
  min: number;
  max: number;
  pas: number;
  valeur: number;
  onChange: (valeur: number) => void;
  affichage: string;
  legende?: string;
  /** Ce que règle le curseur, pour le lecteur d'écran (ex. « Niveau de bruit »). */
  etiquette?: string;
  /**
   * Valeurs à un appui, sous la piste : avec des gants, viser « 10 min » sur
   * 240 crans est impossible ; un gros bouton, non.
   */
  valeursRapides?: readonly { valeur: number; label: string }[];
}) {
  const etiquetteChamp = useContext(EtiquetteChamp);
  const idLegende = useId();
  return (
    <>
      <div className="curseur__valeur" aria-hidden="true">
        <span className="curseur__nombre">{affichage}</span>
        {legende && <span className="carte__source" id={idLegende}>{legende}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={pas}
        value={valeur}
        aria-label={etiquette ?? (etiquetteChamp ? undefined : 'Régler la valeur')}
        aria-labelledby={
          etiquette
            ? undefined
            : [etiquetteChamp, legende ? idLegende : undefined].filter(Boolean).join(' ') || undefined
        }
        // « 97,8 dBA » ou « 10 min » plutôt que « 97.8 » ou « 10 » ; la légende
        // est reliée par aria-labelledby.
        aria-valuetext={affichage}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {valeursRapides && (
        <div className="choix choix--rapides" role="group" aria-label="Valeurs rapides">
          {valeursRapides.map((v) => (
            <button
              key={v.valeur}
              type="button"
              className={`choix__option${v.valeur === valeur ? ' choix__option--actif' : ''}`}
              aria-pressed={v.valeur === valeur}
              onClick={() => onChange(v.valeur)}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function Resultat({
  etiquette,
  valeur,
  note,
  ton,
}: {
  etiquette: string;
  valeur: string;
  note?: string;
  ton?: NiveauVerdict;
}) {
  return (
    <div className={`resultat${ton ? ` resultat--${ton}` : ''}`}>
      <div className="resultat__etiquette">{etiquette}</div>
      <div className="resultat__valeur">{valeur}</div>
      {note && <div className="resultat__note">{note}</div>}
    </div>
  );
}

const PASTILLES: Record<NiveauVerdict, string> = {
  vert: '✓',
  jaune: '!',
  rouge: '✕',
  critique: '⚠',
};

export function Verdict({
  niveau,
  message,
}: {
  niveau: NiveauVerdict;
  message: string;
}) {
  return (
    <div className={`verdict verdict--${niveau}`} role="status" aria-live="polite" aria-atomic="true">
      <span className="verdict__pastille" aria-hidden="true">
        {PASTILLES[niveau]}
      </span>
      <span>{message}</span>
    </div>
  );
}

export function Avertissement({ children }: { children: ReactNode }) {
  return <div className="avertissement">{children}</div>;
}

export function Declic({ children }: { children: ReactNode }) {
  return <div className="declic">{children}</div>;
}

/** Le ton d'une ligne selon l'écart du niveau à la norme des 85 dBA. */
export function tonNiveau(niveauDBA: number): 'danger' | 'attention' | 'ok' {
  if (niveauDBA > 100) return 'danger';
  if (niveauDBA > 85) return 'attention';
  return 'ok';
}

/**
 * Une ligne qu'on peut modifier ou retirer : une source de bruit, une tâche du
 * quart. Les actions sont des vrais boutons de 48 px, pas du texte cliquable.
 */
export function Ligne({
  nom,
  valeur,
  niveauDBA,
  note,
  onRetirer,
  actions,
}: {
  nom: string;
  valeur: string;
  niveauDBA: number;
  note?: string;
  onRetirer?: () => void;
  actions?: ReactNode;
}) {
  return (
    <div className={`ligne ligne--${tonNiveau(niveauDBA)}`}>
      <div className="ligne__haut">
        <span>{nom}</span>
        <span className="ligne__valeur">{valeur}</span>
      </div>
      {note && <div className="ligne__note">{note}</div>}
      {(actions || onRetirer) && (
        <div className="ligne__actions">
          {actions}
          {onRetirer && (
            <button
              type="button"
              className="ligne__bouton ligne__bouton--retirer"
              onClick={onRetirer}
              aria-label={`Retirer ${nom}`}
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Une ligne de l'échelle des niveaux, colorée selon l'écart à la norme. */
export function Barre({
  nom,
  valeur,
  niveauDBA,
  note,
  actif,
  onClick,
}: {
  nom: string;
  valeur: string;
  niveauDBA: number;
  note?: string;
  actif?: boolean;
  onClick?: () => void;
}) {
  const classes = ['barre', `barre--${tonNiveau(niveauDBA)}`, actif ? 'barre--actif' : '']
    .filter(Boolean)
    .join(' ');

  const contenu = (
    <>
      <span>{nom}</span>
      <span className="barre__valeur">{valeur}</span>
      {note && <span className="barre__note">{note}</span>}
    </>
  );

  return onClick ? (
    <button type="button" className={classes} onClick={onClick}>
      {contenu}
    </button>
  ) : (
    <div className={classes}>{contenu}</div>
  );
}
