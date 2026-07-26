/**
 * Outils #1 et #13 — Durée permise et échelle des métiers.
 *
 * La table de la diapo 6 s'arrête à 94 dBA / 1 heure. Le terrain est très
 * au-delà : la formule extrapole, et c'est là que se produit le choc.
 */

import { useState } from 'react';
import { dureePermise, formaterDuree } from '../domain/rsst.js';
import { metierParId, metiers, postesAtelier, tableRsst } from '../data/index.js';
import {
  Avertissement,
  Barre,
  Carte,
  Champ,
  Curseur,
  Declic,
  Resultat,
  Selecteur,
} from '../ui/composants.js';
import { CourbeNiveau } from '../ui/Graphe.js';
import { nb } from '../ui/format.js';

export function DureePermise() {
  const [niveau, setNiveau] = useState(97.8);
  const duree = dureePermise(niveau);
  const ton = duree < 1 ? 'rouge' : duree < 8 ? 'jaune' : 'vert';

  return (
    <Carte
      titre="Combien de temps sans protection ?"
      source="RSST art. 137, diapo 6"
      intro="La table réglementaire s'arrête à 94 dBA. Les postes de la mine sont bien au-dessus."
    >
      <Champ etiquette="Niveau de bruit">
        <Curseur
          min={80}
          max={116}
          pas={0.1}
          valeur={niveau}
          onChange={setNiveau}
          affichage={`${nb(niveau, 1)} dBA`}
          legende="norme : 85 dBA / 8 h"
        />
      </Champ>

      <CourbeNiveau
        min={80}
        max={116}
        valeur={niveau}
        f={dureePermise}
        reperesX={[
          { dBA: 85, label: '85' },
          { dBA: 94, label: '94' },
          { dBA: 105, label: '105' },
          { dBA: 116, label: '116' },
        ]}
        graduationsY={[
          { valeur: 0, label: '0' },
          { valeur: 8, label: '8 h' },
          { valeur: 16, label: '16 h' },
          { valeur: 24, label: '24 h' },
        ]}
        etiquetteValeur={formaterDuree(duree)}
        ton={ton}
        onChange={setNiveau}
        aria={`Courbe : la durée permise s'effondre quand le niveau monte. À ${nb(niveau, 1)} dBA, la durée permise est de ${formaterDuree(duree)}.`}
      />

      <Resultat
        etiquette="Durée maximale permise par jour"
        valeur={formaterDuree(duree)}
        note={
          tableRsst.some((l) => l.niveau_dBA === Math.round(niveau * 10) / 10)
            ? 'valeur inscrite au règlement'
            : 'extrapolée par la règle des 3 dBA'
        }
        ton={ton}
      />

      <Declic>
        Chaque tranche de <strong>3 dBA</strong> divise la durée permise par
        deux. C'est pour cela qu'un mineur au jackleg, à 114,9 dBA, atteint sa
        limite quotidienne en <strong>29 secondes</strong>.
      </Declic>
    </Carte>
  );
}

export function EchelleMetiers() {
  const [selection, setSelection] = useState<string | null>(null);
  const tries = [...metiers].sort((a, b) => b.niveau_dBA - a.niveau_dBA);

  return (
    <Carte
      titre="Mon métier sur l'échelle"
      source="diapo 7"
      intro="Les 13 postes mesurés par la mine, du plus bruyant au moins bruyant. Touche un poste pour voir sa durée permise."
    >
      <div className="barres">
        {tries.map((m) => (
          <Barre
            key={m.id}
            nom={m.nom}
            valeur={`${nb(m.niveau_dBA, 1)} dBA`}
            niveauDBA={m.niveau_dBA}
            actif={selection === m.id}
            note={
              selection === m.id
                ? `durée permise sans protection : ${formaterDuree(dureePermise(m.niveau_dBA))}`
                : undefined
            }
            onClick={() => setSelection(selection === m.id ? null : m.id)}
          />
        ))}
      </div>

      <Declic>
        <strong>Treize postes sur treize dépassent 85 dBA.</strong> Aucun poste
        souterrain mesuré n'est sûr sans protection — pas même celui du
        superviseur.
      </Declic>
    </Carte>
  );
}

export function PostesAtelier() {
  return (
    <Carte
      titre="Les postes d'atelier mesurés"
      source="diapo 9"
      intro="Ces valeurs sont des Leq sur 8 heures, mesurés par dosimétrie. Elles servent à vérifier que le calcul du site colle à la réalité."
    >
      <div className="barres">
        {[...postesAtelier]
          .sort((a, b) => b.leq8h_dBA - a.leq8h_dBA)
          .map((p) => (
            <Barre
              key={p.id}
              nom={p.nom}
              valeur={`${p.leq8h_dBA} dBA`}
              niveauDBA={p.leq8h_dBA}
              note={p.remarque}
            />
          ))}
      </div>

      <Avertissement>
        <strong>Quatre postes sur six dépassent la norme.</strong> L'atelier
        n'est pas un environnement sûr par défaut, même s'il est moins bruyant
        que le fond.
      </Avertissement>
    </Carte>
  );
}

export function ChoixMetier({
  valeur,
  onChange,
}: {
  valeur: string;
  onChange: (id: string) => void;
}) {
  const metier = metierParId(valeur) ?? metiers[0]!;
  return (
    <Champ etiquette={`Mon poste — ${formaterDuree(dureePermise(metier.niveau_dBA))} sans protection`}>
      <Selecteur
        options={metiers}
        valeur={valeur}
        onChange={onChange}
        format={(m) => `${m.nom} — ${m.niveau_dBA} dBA`}
      />
    </Champ>
  );
}
