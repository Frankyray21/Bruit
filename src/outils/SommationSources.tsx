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
import {
  Barre,
  Carte,
  Declic,
  Resultat,
} from '../ui/composants.js';

export function SommationSources() {
  const [machines, setMachines] = useState<number[]>([95, 95]);

  const total = sommeSources(machines);
  const naif = machines.reduce((s, n) => s + n, 0);

  return (
    <Carte
      titre="Deux machines, ça fait combien ?"
      source="diapo 4"
      intro="Ajoute des équipements dans la galerie et regarde le niveau résultant. Ce n'est pas une addition."
    >
      <div className="barres">
        {machines.map((niveau, i) => (
          <Barre
            key={i}
            nom={`Source ${i + 1} — ${niveau} dBA`}
            valeur={`retirer  ×`}
            niveauDBA={niveau}
            note={
              machines.length > 1
                ? `l'éteindre ferait gagner ${gainSiEteinte(machines, i).toFixed(2)} dB`
                : undefined
            }
            onClick={() => setMachines(machines.filter((_, j) => j !== i))}
          />
        ))}
      </div>

      <div className="choix" style={{ marginTop: 12 }}>
        {taches.slice(0, 5).map((t) => (
          <button
            key={t.id}
            type="button"
            className="choix__option"
            onClick={() => setMachines([...machines, t.niveau_dBA])}
          >
            + {t.nom} ({t.niveau_dBA})
          </button>
        ))}
      </div>

      {machines.length > 0 && (
        <Resultat
          etiquette="Niveau résultant"
          valeur={`${total.toFixed(1)} dBA`}
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
        <span className="curseur__nombre">{niveau.toFixed(1)} dBA</span>
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
        valeur={`× ${facteur < 10 ? facteur.toFixed(1) : Math.round(facteur).toLocaleString('fr-CA')}`}
        note={`${(niveau - 85).toFixed(1)} dBA au-dessus de la limite des 8 heures`}
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
