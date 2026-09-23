/**
 * Outil #5 — Budget de retrait.
 *
 * Répond à la question que le curseur de temps de port fait naître sans y
 * répondre : « alors, combien de temps ai-je le droit de les enlever ? »
 * La sortie est un budget de minutes, pas une consigne morale. Poste et
 * protecteur viennent du profil : ceux du travailleur, pas un exemple.
 */

import { budgetRetrait } from '../domain/retrait.js';
import { attenuationReelle } from '../domain/protection.js';
import { useConfig } from '../etat/config.js';
import { useTravailleur } from '../etat/travailleur.js';
import { Avertissement, Carte, Resultat, Verdict } from '../ui/composants.js';
import { ChampPoste, ChampProtecteur } from '../ui/ProfilChamps.js';
import { formatMinutes } from './TempsDePort.js';
import { nb } from '../ui/format.js';

export function BudgetRetrait() {
  const { facteurPour } = useConfig();
  const { poste: metier, protecteur } = useTravailleur();
  const nominale = attenuationReelle(protecteur.nrr, facteurPour(protecteur));
  const budget = budgetRetrait(metier.niveau_dBA, nominale);

  return (
    <Carte
      titre="Ton budget de retrait"
      source="d'après la diapo 16"
      intro="« Porter la protection en tout temps » est un slogan que personne n'applique à la lettre : tout le monde enlève ses bouchons pour parler. Voici combien de temps tu peux le faire sans dépasser la norme."
    >
      <ChampPoste />
      <ChampProtecteur />

      {budget.realisable ? (
        <>
          <Resultat
            etiquette="Retrait toléré sur ton quart"
            valeur={formatMinutes(Math.floor(budget.minutesDeRetrait))}
            note={`soit un port de ${nb(budget.tempsDePortMinimal * 100, 1)} % du temps`}
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
            de poste, ou une réduction du bruit à la source. Parles-en à ton
            superviseur ou au comité SST.
          </Avertissement>
        </>
      )}
    </Carte>
  );
}
