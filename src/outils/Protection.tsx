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
  metierParId,
  metiers,
  protecteurParId,
} from '../data/index.js';
import { useConfig } from '../etat/config.js';
import {
  Avertissement,
  Carte,
  Champ,
  Declic,
  Resultat,
  Selecteur,
  Verdict,
} from '../ui/composants.js';
import { nb } from '../ui/format.js';

export function Protection() {
  const { facteurBouchons, facteurCoquilles } = useConfig();
  const [metierId, setMetierId] = useState('mineur-jackleg');
  const [bouchonId, setBouchonId] = useState('howard-leight-max');
  const [coquilleId, setCoquilleId] = useState('coquilles-casque');
  const [double, setDouble] = useState(false);

  const metier = metierParId(metierId) ?? metiers[0]!;
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

  return (
    <Carte
      titre="Ma protection suffit-elle ?"
      source="diapos 13 et 14"
      intro="Le NRR est mesuré en laboratoire. Sur le terrain, on n'en retire qu'une partie."
    >
      <Champ etiquette="Mon poste">
        <Selecteur
          options={metiers}
          valeur={metierId}
          onChange={setMetierId}
          format={(m) => `${m.nom} — ${m.niveau_dBA} dBA`}
        />
      </Champ>

      <Champ etiquette="Bouchons">
        <Selecteur
          options={bouchons}
          valeur={bouchonId}
          onChange={setBouchonId}
          format={(p) => `${p.nom} — NRR ${p.nrr}`}
        />
      </Champ>

      <Champ etiquette="Protection">
        <div className="choix">
          <button
            type="button"
            className={`choix__option${!double ? ' choix__option--actif' : ''}`}
            onClick={() => setDouble(false)}
          >
            Bouchons seuls
          </button>
          <button
            type="button"
            className={`choix__option${double ? ' choix__option--actif' : ''}`}
            onClick={() => setDouble(true)}
          >
            Double protection
          </button>
        </div>
      </Champ>

      {double && (
        <Champ etiquette="Coquilles">
          <Selecteur
            options={coquilles}
            valeur={coquilleId}
            onChange={setCoquilleId}
            format={(p) => `${p.nom} — NRR ${p.nrr}`}
          />
        </Champ>
      )}

      <Resultat
        etiquette="Atténuation réelle"
        valeur={`${nb(attenuation, 1)} dB`}
        note={
          double
            ? `le meilleur NRR (${Math.max(bouchon.nrr, coquille.nrr)}) dératé à ${nb((facteurBouchons * 100), 0)} %, plus 5 dB`
            : `NRR ${bouchon.nrr} dératé à ${nb((facteurBouchons * 100), 0)} %`
        }
      />

      <Resultat
        etiquette="Niveau perçu sous la protection"
        valeur={`${nb(restant, 1)} dBA`}
        note={`durée permise : ${formaterDuree(dureePermise(restant))}`}
        ton={restant > 85 ? 'rouge' : restant < 70 ? 'jaune' : 'vert'}
      />

      <Verdict niveau={verdict.niveau} message={verdict.message} />

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
          d'exposition, ou une réduction du bruit à la source. À porter au
          comité SST.
        </Avertissement>
      )}

      {restant < 70 && verdict.niveau !== 'critique' && (
        <Avertissement>
          À <strong>{nb(restant, 0)} dBA</strong> sous la protection, tu
          risques de ne plus entendre les alarmes, les véhicules ni tes
          collègues. Ce point ne figure pas dans la formation — à valider avec
          ton formateur avant d'en tirer une conclusion.
        </Avertissement>
      )}
    </Carte>
  );
}

/** Outil #10 — le facteur de dérating, exposé parce que l'arbitrage est ouvert. */
export function FacteurDerating() {
  const { facteurBouchons, setFacteurBouchons } = useConfig();

  const jackleg = metierParId('mineur-jackleg')!;
  const attenuation = attenuationDoubleProtection(33, 25, facteurBouchons);
  const duree = dureePermise(jackleg.niveau_dBA - attenuation);

  return (
    <Carte
      titre="Le facteur d'efficacité"
      source="diapos 13 et 14"
      intro="La formation se contredit : la diapo 13 annonce 70 % d'efficacité pour les bouchons, mais l'exemple chiffré de la diapo 14 calcule avec 60 %."
    >
      <Champ etiquette="Efficacité réelle des bouchons">
        <div className="choix">
          {[0.5, 0.6, 0.7].map((f) => (
            <button
              key={f}
              type="button"
              className={`choix__option${Math.abs(facteurBouchons - f) < 0.001 ? ' choix__option--actif' : ''}`}
              onClick={() => setFacteurBouchons(f)}
            >
              {nb((f * 100), 0)} %
            </button>
          ))}
        </div>
      </Champ>

      <Resultat
        etiquette="Jackleg en double protection — durée permise"
        valeur={formaterDuree(duree)}
        note="avec le meilleur bouchon du catalogue (NRR 33)"
        ton={duree >= 8 ? 'vert' : 'rouge'}
      />

      <Avertissement>
        Ce réglage n'est <strong>pas cosmétique</strong> : il fait passer ce
        poste de 2 h 28 à 5 h 17. Le site retient 60 % par défaut, la valeur la
        plus conservatrice et celle qui reproduit l'exemple enseigné. À trancher
        avec le formateur.
      </Avertissement>
    </Carte>
  );
}
