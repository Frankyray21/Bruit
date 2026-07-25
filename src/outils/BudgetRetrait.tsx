/**
 * Outil #5 — Budget de retrait.
 *
 * Répond à la question que le curseur de temps de port fait naître sans y
 * répondre : « alors, combien de temps ai-je le droit de les enlever ? »
 * La sortie est un budget de minutes, pas une consigne morale.
 */

import { useState } from 'react';
import { budgetRetrait } from '../domain/retrait.js';
import { attenuationReelle } from '../domain/protection.js';
import { bouchons, metierParId, metiers, protecteurParId } from '../data/index.js';
import { useConfig } from '../etat/config.js';
import {
  Avertissement,
  Carte,
  Champ,
  Resultat,
  Selecteur,
  Verdict,
} from '../ui/composants.js';
import { formatMinutes } from './TempsDePort.js';
import { nb } from '../ui/format.js';

export function BudgetRetrait() {
  const { facteurBouchons } = useConfig();
  const [metierId, setMetierId] = useState('foreur-long-trou');
  const [protecteurId, setProtecteurId] = useState('laser-lite');

  const metier = metierParId(metierId) ?? metiers[0]!;
  const protecteur = protecteurParId(protecteurId) ?? bouchons[0]!;
  const nominale = attenuationReelle(protecteur.nrr, facteurBouchons);
  const budget = budgetRetrait(metier.niveau_dBA, nominale);

  return (
    <Carte
      titre="Ton budget de retrait"
      source="diapo 16, inversée"
      intro="« Porter la protection en tout temps » est un slogan que personne n'applique à la lettre : tout le monde enlève ses bouchons pour parler. Voici combien de temps tu peux le faire sans dépasser la norme."
    >
      <Champ etiquette="Mon poste">
        <Selecteur
          options={metiers}
          valeur={metierId}
          onChange={setMetierId}
          format={(m) => `${m.nom} — ${m.niveau_dBA} dBA`}
        />
      </Champ>

      <Champ etiquette="Mon protecteur">
        <Selecteur
          options={bouchons}
          valeur={protecteurId}
          onChange={setProtecteurId}
          format={(p) => `${p.nom} — NRR ${p.nrr}`}
        />
      </Champ>

      {budget.realisable ? (
        <>
          <Resultat
            etiquette="Retrait toléré sur ton quart"
            valeur={formatMinutes(Math.floor(budget.minutesDeRetrait))}
            note={`soit un port de ${nb((budget.tempsDePortMinimal * 100), 1)} % du temps`}
            ton={budget.minutesDeRetrait < 30 ? 'jaune' : 'vert'}
          />
          <Verdict
            niveau={budget.minutesDeRetrait < 30 ? 'jaune' : 'vert'}
            message={
              budget.minutesDeRetrait < 30
                ? 'Marge très mince — une pause-jasette suffit à la brûler'
                : 'Marge confortable, à condition de la compter'
            }
          />
        </>
      ) : (
        <>
          <Resultat
            etiquette="Retrait toléré sur ton quart"
            valeur="Aucun"
            note="et même porté en permanence, ce protecteur ne ramène pas ce poste sous 85 dBA"
            ton="critique"
          />
          <Verdict
            niveau="critique"
            message="Ce protecteur est inadéquat pour ce poste"
          />
          <Avertissement>
            <strong>Ce n'est pas un problème de discipline.</strong> Aucun temps
            de port ne suffit ici : il faut une double protection, une rotation
            de poste, ou une réduction du bruit à la source. À signaler au
            comité SST.
          </Avertissement>
        </>
      )}
    </Carte>
  );
}
