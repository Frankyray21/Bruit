/**
 * Outils #3, #4 et #10 — Atténuation réelle, double protection, facteur de
 * dérating.
 *
 * Diapos 13 et 14. Le message central : les atténuations ne s'additionnent pas.
 */

import { useState } from 'react';
import {
  attenuationDoubleProtection,
  attenuationReelle,
  doubleProtectionRecommandee,
} from '../domain/protection.js';
import { dureePermise, formaterDuree } from '../domain/rsst.js';
import { protectionSuffisante } from '../domain/verdict.js';
import {
  bouchons,
  coquilles,
  meilleurBouchon,
  metierParId,
  protecteurParId,
} from '../data/index.js';
import { useConfig } from '../etat/config.js';
import { useTravailleur } from '../etat/travailleur.js';
import {
  Avertissement,
  Carte,
  Champ,
  Choix,
  Declic,
  Resultat,
  Selecteur,
  Verdict,
} from '../ui/composants.js';
import { ChampPoste, formatProtecteur } from '../ui/ProfilChamps.js';
import { nb } from '../ui/format.js';

export function Protection() {
  const { facteurBouchons, facteurCoquilles } = useConfig();
  const { poste: metier, protecteur } = useTravailleur();
  // Les bouchons partent de ceux du profil (s'il en a), les coquilles restent
  // un choix local : la double protection est une simulation.
  const [bouchonId, setBouchonId] = useState(
    protecteur.type === 'bouchons' ? protecteur.id : meilleurBouchon.id,
  );
  const [coquilleId, setCoquilleId] = useState('coquilles-casque');
  const [double, setDouble] = useState(false);

  const bouchon = protecteurParId(bouchonId) ?? bouchons[0]!;
  const coquille = protecteurParId(coquilleId) ?? coquilles[0]!;

  const simple = attenuationReelle(bouchon.nrr, facteurBouchons);
  const doubleAtt = attenuationDoubleProtection(
    bouchon.nrr,
    coquille.nrr,
    facteurBouchons,
  );
  const attenuation = double ? doubleAtt : simple;
  const restant = metier.niveau_dBA - attenuation;
  const verdict = protectionSuffisante(
    metier.niveau_dBA,
    bouchon.nrr,
    coquille.nrr,
    facteurBouchons,
  );

  const additionNaive = bouchon.nrr + coquille.nrr;

  // Le moteur juge l'équipement ; l'écran juge ce que le travailleur a
  // sélectionné. En double protection suffisante, le verdict est vert — pas
  // « double protection requise » à quelqu'un qui la porte déjà.
  const affiche =
    verdict.niveau === 'jaune'
      ? double
        ? { niveau: 'vert' as const, message: 'Suffisant en double protection' }
        : {
            niveau: 'rouge' as const,
            message: 'Bouchons seuls insuffisants — passe en double protection',
          }
      : verdict;

  return (
    <Carte
      titre="Ma protection suffit-elle ?"
      source="diapos 13 et 14"
      intro="Le NRR est mesuré en laboratoire. Sur le terrain, on n'en retire qu'une partie."
    >
      <ChampPoste />

      <Champ etiquette="Bouchons">
        <Selecteur
          options={bouchons}
          valeur={bouchonId}
          onChange={setBouchonId}
          format={formatProtecteur}
          etiquette="Bouchons"
        />
      </Champ>

      <Champ etiquette="Simple ou double ?">
        <Choix
          options={[
            { id: 'simple', nom: 'Bouchons seuls' },
            { id: 'double', nom: 'Bouchons + coquilles' },
          ]}
          valeur={double ? 'double' : 'simple'}
          onChange={(id) => setDouble(id === 'double')}
        />
      </Champ>

      {double && (
        <Champ etiquette="Coquilles">
          <Selecteur
            options={coquilles}
            valeur={coquilleId}
            onChange={setCoquilleId}
            format={formatProtecteur}
            etiquette="Coquilles"
          />
        </Champ>
      )}

      <Resultat
        etiquette="Atténuation réelle"
        valeur={`${nb(attenuation, 1)} dB`}
        note={
          double
            ? `le meilleur NRR (${Math.max(bouchon.nrr, coquille.nrr)}) à ${nb(facteurBouchons * 100, 0)} % d'efficacité, plus 5 dB`
            : `NRR ${bouchon.nrr} à ${nb(facteurBouchons * 100, 0)} % d'efficacité sur le terrain`
        }
      />

      <Resultat
        etiquette="Niveau perçu sous la protection"
        valeur={`${nb(restant, 1)} dBA`}
        note={`durée permise : ${formaterDuree(dureePermise(restant))}`}
        ton={restant > 85 ? 'rouge' : 'vert'}
      />

      <Verdict niveau={affiche.niveau} message={affiche.message} />

      {double && (
        <Declic>
          <strong>Les atténuations ne s'additionnent pas.</strong> NRR{' '}
          {bouchon.nrr} + NRR {coquille.nrr} ne donnent pas {additionNaive} dB
          de réduction mais <strong>{nb(doubleAtt, 0)} dB</strong>. On part
          du meilleur des deux et on ajoute environ 5 dB.
        </Declic>
      )}

      {doubleProtectionRecommandee(metier.niveau_dBA) && !double && (
        <Avertissement>
          Ce poste dépasse <strong>105 dBA</strong> : la double protection y est
          recommandée.
        </Avertissement>
      )}

      {verdict.niveau === 'critique' && (
        <Avertissement>
          <strong>Même la double protection ne suffit pas ici.</strong> Sur les
          treize postes mesurés, c'est le seul cas. La réponse n'est pas un
          meilleur bouchon : c'est une rotation de poste, une limite de temps
          d'exposition, ou une réduction du bruit à la source. Parles-en à ton
          superviseur ou au comité SST.
        </Avertissement>
      )}

      {restant < 70 && verdict.niveau !== 'critique' && (
        <Avertissement>
          À <strong>{nb(restant, 0)} dBA</strong> sous la protection, tu
          risques de ne plus entendre les alarmes, les véhicules ni tes
          collègues. Ce point ne fait pas partie de la formation : parles-en à
          ton formateur avant d'en tirer une conclusion.
        </Avertissement>
      )}
    </Carte>
  );
}

/**
 * Outil #10 — le facteur de dérating, réglable par le formateur.
 *
 * Il vit dans « Réglages du formateur », pas dans le parcours : la
 * contradiction de la formation (70 % à la diapo 13, 60 % dans l'exemple de la
 * diapo 14) se tranche en salle, pas sur le téléphone d'un travailleur.
 */
export function FacteurDerating() {
  const { facteurBouchons, setFacteurBouchons } = useConfig();

  const jackleg = metierParId('mineur-jackleg')!;
  const attenuation = attenuationDoubleProtection(33, 25, facteurBouchons);
  const duree = dureePermise(jackleg.niveau_dBA - attenuation);
  const options = [0.5, 0.6, 0.7].map((f) => ({
    id: String(f),
    nom: `${nb(f * 100, 0)} %`,
  }));
  const actif =
    options.find((o) => Math.abs(Number(o.id) - facteurBouchons) < 0.001)?.id ??
    String(facteurBouchons);

  return (
    <Carte
      titre="Efficacité des bouchons sur le terrain"
      source="diapos 13 et 14"
      intro="La formation donne deux valeurs : 70 % à la diapo 13, 60 % dans l'exemple chiffré de la diapo 14. Le site utilise 60 % par défaut — la valeur la plus prudente, celle de l'exemple enseigné. Ce réglage s'applique à tous les calculateurs de cet appareil."
    >
      <Champ etiquette="Efficacité réelle des bouchons">
        <Choix options={options} valeur={actif} onChange={(id) => setFacteurBouchons(Number(id))} />
      </Champ>

      <Resultat
        etiquette="Jackleg en double protection — durée permise"
        valeur={formaterDuree(duree)}
        note="avec le meilleur bouchon du catalogue (NRR 33)"
        ton={duree >= 8 ? 'vert' : 'rouge'}
      />

      <Avertissement>
        Ce réglage n'est <strong>pas cosmétique</strong> : il fait passer ce
        poste de 2 h 28 à 5 h 17 de durée permise. Garde la même valeur sur
        tous les appareils d'un même groupe.
      </Avertissement>
    </Carte>
  );
}
