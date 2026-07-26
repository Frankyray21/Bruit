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
import { Carte, Declic, Ligne, Resultat, Verdict } from '../ui/composants.js';
import { HorlogeDose, type SommetDose } from '../ui/Graphe.js';
import { nb, pourcent } from '../ui/format.js';

interface LigneQuart extends TacheDomaine {
  readonly cle: number;
  readonly nom: string;
}

const QUART_DEBUT_H = 7;

let prochaineCle = 0;

const DEPART: LigneQuart[] = [
  { cle: prochaineCle++, nom: 'Meulage', niveauDBA: 95, dureeH: 2 },
  { cle: prochaineCle++, nom: 'Marteau aiguille', niveauDBA: 92, dureeH: 1.5 },
  { cle: prochaineCle++, nom: 'Ambiant en pause', niveauDBA: 66, dureeH: 2 },
];

export function ComposeurQuart() {
  const [lignes, setLignes] = useState<LigneQuart[]>(DEPART);

  const total = dose(lignes);
  const lex = niveauEquivalent8h(total);
  const moment = momentLimiteAtteinte(lignes);
  const heures = lignes.reduce((s, l) => s + l.dureeH, 0);
  const verdict = verdictDose(total);

  // Sommets de la dose cumulée, un par frontière de tâche : la pente d'un
  // segment = la vitesse d'accumulation de la tâche (constante à niveau fixe).
  const sommets: SommetDose[] = [{ h: 0, dose: 0 }];
  {
    let cumul = 0;
    let ecoule = 0;
    for (const l of lignes) {
      cumul += dose([l]);
      ecoule += l.dureeH;
      sommets.push({ h: ecoule, dose: cumul });
    }
  }

  function ajouter(id: string) {
    const tache = taches.find((t) => t.id === id);
    if (!tache) return;
    setLignes([
      ...lignes,
      {
        cle: prochaineCle++,
        nom: tache.nom,
        niveauDBA: tache.niveau_dBA,
        dureeH: 1,
      },
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
      {lignes.map((l, i) => (
        <Ligne
          key={l.cle}
          nom={`${l.nom} — ${l.niveauDBA} dBA`}
          valeur={pourcent(dose([l]))}
          niveauDBA={l.niveauDBA}
          onRetirer={() => setLignes(lignes.filter((_, j) => j !== i))}
          actions={
            <>
              <button
                type="button"
                className="ligne__bouton"
                onClick={() => ajusterDuree(i, -0.5)}
                aria-label={`Réduire la durée de ${l.nom}`}
              >
                − 30 min
              </button>
              <span className="ligne__duree">{formaterDuree(l.dureeH)}</span>
              <button
                type="button"
                className="ligne__bouton"
                onClick={() => ajusterDuree(i, 0.5)}
                aria-label={`Allonger la durée de ${l.nom}`}
              >
                + 30 min
              </button>
            </>
          }
        />
      ))}

      <div className="ajouts">
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

      {total > 0 && (
        <HorlogeDose
          sommets={sommets}
          momentLimite={moment}
          momentLabel={moment !== null ? formaterDuree(moment) : ''}
          doseTotale={total}
          aria={`Dose cumulée du quart en fonction des heures écoulées : elle franchit la limite des 100 %${
            moment !== null ? ` après ${formaterDuree(moment)}` : ''
          } et atteint ${Math.round(total)} % en fin de quart. La dose ne redescend jamais ; les heures sont comptées dans l'ordre des tâches, en partant de zéro.`}
        />
      )}

      <Resultat
        etiquette={`Dose du quart — ${formaterDuree(heures)} de travail`}
        valeur={pourcent(total)}
        note={`niveau équivalent sur 8 h : ${nb(lex, 1)} dBA`}
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
