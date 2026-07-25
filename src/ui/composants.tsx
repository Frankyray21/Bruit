/**
 * Composants « terrain » : gros contrôles, contrastes forts, aucune saisie de
 * texte libre dans le parcours principal.
 */

import { useId, type ReactNode } from 'react';
import type { NiveauVerdict } from '../domain/verdict.js';

export function Carte({
  titre,
  source,
  intro,
  children,
}: {
  titre?: string;
  source?: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="carte">
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
 * Le groupe porte `aria-labelledby` plutôt qu'un `<label for>` : plusieurs
 * champs contiennent deux contrôles (un sélecteur et un curseur), et un label
 * ne peut en désigner qu'un seul.
 */
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
      {children}
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
}: {
  options: readonly T[];
  valeur: string;
  onChange: (id: string) => void;
  format?: (option: T) => string;
}) {
  return (
    <select
      className="choix__select"
      value={valeur}
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
}: {
  min: number;
  max: number;
  pas: number;
  valeur: number;
  onChange: (valeur: number) => void;
  affichage: string;
  legende?: string;
}) {
  return (
    <>
      <div className="curseur__valeur">
        <span className="curseur__nombre">{affichage}</span>
        {legende && <span className="carte__source">{legende}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={pas}
        value={valeur}
        onChange={(e) => onChange(Number(e.target.value))}
      />
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
    <div className={`verdict verdict--${niveau}`} role="status">
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
