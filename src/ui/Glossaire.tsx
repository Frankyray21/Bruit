/**
 * Termes cliquables et fiche en fenêtre.
 *
 * `<Terme id="acouphenes">Acouphènes</Terme>` rend un bouton discret (mot
 * souligné en pointillé) ; le clic ouvre UNE fenêtre partagée (`<dialog>`
 * natif : Échap ferme, le focus reste dedans, le fond est inerte) avec la
 * fiche du glossaire. Le fournisseur se pose une fois, à la racine.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ficheGlossaire } from '../data/glossaire.js';

const ContexteGlossaire = createContext<((id: string) => void) | null>(null);

export function FournisseurGlossaire({ children }: { children: ReactNode }) {
  const [ouvert, setOuvert] = useState<string | null>(null);
  const boite = useRef<HTMLDialogElement>(null);
  const declencheur = useRef<HTMLElement | null>(null);

  const ouvrir = useCallback((id: string) => {
    declencheur.current = document.activeElement as HTMLElement | null;
    setOuvert(id);
  }, []);

  useEffect(() => {
    const d = boite.current;
    if (!d) return;
    if (ouvert && !d.open) d.showModal();
    if (!ouvert && d.open) d.close();
  }, [ouvert]);

  const fermer = () => {
    setOuvert(null);
    declencheur.current?.focus?.();
  };

  const fiche = ouvert ? ficheGlossaire(ouvert) : undefined;
  const valeur = useMemo(() => ouvrir, [ouvrir]);

  return (
    <ContexteGlossaire.Provider value={valeur}>
      {children}
      <dialog
        ref={boite}
        className="fenetre"
        aria-labelledby="fenetre-titre"
        onClose={fermer}
        onClick={(e) => {
          // Clic sur le voile (hors de la boîte) : ferme.
          if (e.target === e.currentTarget) fermer();
        }}
      >
        {fiche && (
          <article className="fenetre__contenu">
            <header className="fenetre__entete">
              <div>
                <p className="fenetre__sur">Le mot, en clair</p>
                <h2 id="fenetre-titre" className="fenetre__titre">
                  {fiche.terme}
                </h2>
              </div>
              <button
                type="button"
                className="fenetre__fermer"
                onClick={fermer}
                aria-label="Fermer"
                autoFocus
              >
                ×
              </button>
            </header>
            <p className="fenetre__court">{fiche.court}</p>
            {fiche.details.map((p) =>
              p.startsWith('Complément — ') ? (
                <p key={p} className="fenetre__complement">
                  <strong>Complément.</strong>{' '}
                  {(() => {
                    const t = p.slice('Complément — '.length);
                    return t.charAt(0).toUpperCase() + t.slice(1);
                  })()}
                </p>
              ) : (
                <p key={p}>{p}</p>
              ),
            )}
            <p className="fenetre__retenir">
              <strong>À retenir.</strong> {fiche.aRetenir}
            </p>
            <footer className="fenetre__pied">
              <span className="carte__source">{fiche.source}</span>
              <button type="button" className="bouton bouton--secondaire" onClick={fermer}>
                Fermer
              </button>
            </footer>
          </article>
        )}
      </dialog>
    </ContexteGlossaire.Provider>
  );
}

/** Un mot cliquable qui ouvre sa fiche. Sans fournisseur, rend le texte tel quel. */
export function Terme({ id, children }: { id: string; children: ReactNode }) {
  const ouvrir = useContext(ContexteGlossaire);
  if (!ouvrir || !ficheGlossaire(id)) return <strong>{children}</strong>;
  return (
    <button
      type="button"
      className="terme"
      onClick={() => ouvrir(id)}
      aria-haspopup="dialog"
      title="Voir la définition"
    >
      {children}
    </button>
  );
}
