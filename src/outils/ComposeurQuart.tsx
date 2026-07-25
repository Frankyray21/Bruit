/**
 * Outil #2 — Composeur de quart et horloge de dose.
 *
 * Diapos 7 et 8. Montre trois choses invisibles dans les tableaux : le silence
 * ne rembourse pas le bruit, l'intensité écrase la durée, et la journée est
 * souvent finie au sens réglementaire avant la pause-café.
 */

import { useState } from 'react';
import {
  dose,
  formaterDuree,
  momentLimiteAtteinte,
  niveauEquivalent8h,
  type Tache as TacheDomaine,
} from '../domain/rsst.js';
import { verdictDose } from '../domain/verdict.js';
import { taches } from '../data/index.js';
import {
  Barre,
  Carte,
  Declic,
  Resultat,
  Verdict,
} from '../ui/composants.js';

interface Ligne extends TacheDomaine {
  readonly id: string;
  readonly nom: string;
}

const QUART_DEBUT_H = 7;

const DEPART: Ligne[] = [
  { id: 'meulage', nom: 'Meulage', niveauDBA: 95, dureeH: 2 },
  { id: 'marteau-aiguille', nom: 'Marteau aiguille', niveauDBA: 92, dureeH: 1.5 },
  { id: 'ambiant-pause', nom: 'Ambiant en pause', niveauDBA: 66, dureeH: 2 },
];

export function ComposeurQuart() {
  const [lignes, setLignes] = useState<Ligne[]>(DEPART);

  const total = dose(lignes);
  const lex = niveauEquivalent8h(total);
  const moment = momentLimiteAtteinte(lignes);
  const heures = lignes.reduce((s, l) => s + l.dureeH, 0);
  const verdict = verdictDose(total);

  function ajouter(id: string) {
    const tache = taches.find((t) => t.id === id);
    if (!tache) return;
    setLignes([
      ...lignes,
      { id: `${id}-${lignes.length}`, nom: tache.nom, niveauDBA: tache.niveau_dBA, dureeH: 1 },
    ]);
  }

  function ajusterDuree(index: number, delta: number) {
    setLignes(
      lignes.map((l, i) =>
        i === index ? { ...l, dureeH: Math.max(0.5, l.dureeH + delta) } : l,
      ),
    );
  }

  return (
    <Carte
      titre="Compose ton quart"
      source="diapos 7 et 8"
      intro="Empile tes tâches de la journée. La dose se cumule : 100 %, c'est la limite réglementaire du quart."
    >
      <div className="barres">
        {lignes.map((l, i) => (
          <div key={l.id} className="barre barre--attention" style={{ display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span>
                {l.nom} — {l.niveauDBA} dBA
              </span>
              <span className="barre__valeur">{dose([l]).toFixed(0)} %</span>
            </div>
            <div className="barre-boutons" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="choix__option"
                onClick={() => ajusterDuree(i, -0.5)}
              >
                −30 min
              </button>
              <span className="choix__option" style={{ textAlign: 'center' }}>
                {formaterDuree(l.dureeH)}
              </span>
              <button
                type="button"
                className="choix__option"
                onClick={() => ajusterDuree(i, 0.5)}
              >
                +30 min
              </button>
              <button
                type="button"
                className="choix__option"
                onClick={() => setLignes(lignes.filter((_, j) => j !== i))}
                aria-label={`Retirer ${l.nom}`}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="choix" style={{ marginTop: 12 }}>
        {taches.map((t) => (
          <button
            key={t.id}
            type="button"
            className="choix__option"
            onClick={() => ajouter(t.id)}
          >
            + {t.nom}
          </button>
        ))}
      </div>

      <Resultat
        etiquette={`Dose du quart — ${formaterDuree(heures)} de travail`}
        valeur={`${total.toFixed(0)} %`}
        note={`niveau équivalent sur 8 h : ${lex.toFixed(1)} dBA`}
        ton={verdict.niveau}
      />

      {moment !== null && (
        <Resultat
          etiquette="Limite atteinte à"
          valeur={heureDuJour(QUART_DEBUT_H + moment)}
          note={`après ${formaterDuree(moment)} de quart, en partant à 7 h 00`}
          ton="rouge"
        />
      )}

      <Verdict niveau={verdict.niveau} message={verdict.message} />

      <Declic>
        Regarde le poids d'une pause : <strong>deux heures à 66 dBA pèsent
        0,3 %</strong> de la dose. Le silence ne rembourse pas le bruit, il ne
        fait que ne rien ajouter. Et une demi-heure de drill à air pèse plus
        lourd qu'une heure et demie de meulage : l'intensité écrase la durée.
      </Declic>
    </Carte>
  );
}

function heureDuJour(heures: number): string {
  const h = Math.floor(heures);
  const m = Math.round((heures - h) * 60);
  return `${h} h ${String(m).padStart(2, '0')}`;
}
