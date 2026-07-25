/**
 * Outils #7 et #11 — Sommation de sources et échelle d'énergie.
 *
 * La formation affirme « à chaque 3 dBA, l'impact est doublé » (diapo 4) sans
 * jamais l'expliquer. Cet outil le démontre, et doit donc précéder tout le
 * reste du parcours.
 */

import { useState } from 'react';
import { energieRelative, gainSiEteinte, sommeSources } from '../domain/sources.js';
import { taches } from '../data/index.js';
import { Carte, Declic, Ligne, Resultat } from '../ui/composants.js';
import { nb } from '../ui/format.js';

interface Source {
  readonly cle: number;
  readonly nom: string;
  readonly niveauDBA: number;
}

let prochaineCle = 0;

export function SommationSources() {
  const [sources, setSources] = useState<Source[]>([
    { cle: prochaineCle++, nom: 'Machine 1', niveauDBA: 95 },
    { cle: prochaineCle++, nom: 'Machine 2', niveauDBA: 95 },
  ]);

  const niveaux = sources.map((s) => s.niveauDBA);
  const total = sommeSources(niveaux);
  const naif = niveaux.reduce((s, n) => s + n, 0);

  return (
    <Carte
      titre="Deux machines, ça fait combien ?"
      source="diapo 4"
      intro="Ajoute des équipements dans la galerie et regarde le niveau résultant. Ce n'est pas une addition."
    >
      {sources.map((s, i) => (
        <Ligne
          key={s.cle}
          nom={s.nom}
          valeur={`${s.niveauDBA} dBA`}
          niveauDBA={s.niveauDBA}
          note={
            sources.length > 1
              ? `l'éteindre ferait gagner ${nb(gainSiEteinte(niveaux, i), 2)} dB`
              : undefined
          }
          onRetirer={() => setSources(sources.filter((_, j) => j !== i))}
        />
      ))}

      <div className="ajouts">
        {taches.slice(0, 5).map((t) => (
          <button
            key={t.id}
            type="button"
            className="choix__option"
            onClick={() =>
              setSources([
                ...sources,
                { cle: prochaineCle++, nom: t.nom, niveauDBA: t.niveau_dBA },
              ])
            }
          >
            + {t.nom} ({t.niveau_dBA})
          </button>
        ))}
      </div>

      {sources.length > 0 && (
        <Resultat
          etiquette="Niveau résultant"
          valeur={`${nb(total, 1)} dBA`}
          note={`l'addition naïve donnerait ${naif} dBA — ce qui n'a aucun sens physique`}
          ton={total > 100 ? 'rouge' : total > 85 ? 'jaune' : 'vert'}
        />
      )}

      <Declic>
        <strong>Deux machines identiques ajoutent exactement 3 dB.</strong>{' '}
        C'est de là que vient la règle de la diapo 4 : 3 dBA de plus, c'est deux
        fois plus d'énergie dans l'oreille. Et l'inverse est vrai — éteindre la
        machine la plus faible ne sert presque à rien. Pour gagner du silence,
        il faut s'attaquer à la source dominante.
      </Declic>
    </Carte>
  );
}

export function EchelleEnergie() {
  const [niveau, setNiveau] = useState(114.9);
  const facteur = energieRelative(niveau);

  return (
    <Carte
      titre="Ce que « 3 dBA » veut vraiment dire"
      source="diapo 4"
      intro="Le décibel est une échelle logarithmique : quelques dBA de plus, et l'énergie reçue explose."
    >
      <div className="curseur__valeur">
        <span className="curseur__nombre">{nb(niveau, 1)} dBA</span>
        <span className="carte__source">norme : 85 dBA</span>
      </div>
      <input
        type="range"
        min={85}
        max={115}
        step={0.1}
        value={niveau}
        onChange={(e) => setNiveau(Number(e.target.value))}
      />

      <Resultat
        etiquette="Énergie reçue, comparée à la norme"
        valeur={`× ${facteur < 10 ? nb(facteur, 1) : Math.round(facteur).toLocaleString('fr-CA')}`}
        note={`${nb((niveau - 85), 1)} dBA au-dessus de la limite des 8 heures`}
        ton={facteur > 100 ? 'rouge' : facteur > 10 ? 'jaune' : 'vert'}
      />

      <Declic>
        Le mineur au jackleg, à 114,9 dBA, reçoit près de{' '}
        <strong>mille fois</strong> l'énergie sonore que la norme autorise sur
        huit heures.
      </Declic>
    </Carte>
  );
}
