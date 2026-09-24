/**
 * Outil #6 — Comparateur de deux protecteurs à temps de port différents.
 *
 * Renverse la lecture de la diapo 13, qui classe les protecteurs par NRR
 * décroissant : un NRR 20 gardé en permanence bat un NRR 33 enlevé 48 minutes.
 */

import {
  attenuationEffective,
  attenuationReelle,
} from '../domain/protection.js';
import { bouchons, protecteurParId, protecteurs } from '../data/index.js';
import { useConfig } from '../etat/config.js';
import { useStockage } from '../etat/stockage.js';
import { useTravailleur } from '../etat/travailleur.js';
import {
  Carte,
  Champ,
  Curseur,
  Declic,
  Resultat,
  Selecteur,
} from '../ui/composants.js';
import { formatMinutes, RETRAITS_RAPIDES } from './TempsDePort.js';
import { nb } from '../ui/format.js';

const QUART_MIN = 8 * 60;

export function Comparateur() {
  const { facteurPour } = useConfig();
  const { protecteur } = useTravailleur();
  // A = ton protecteur, retiré 48 minutes ; B = l'arceau le plus modeste,
  // jamais retiré. Le renversement se voit au premier regard. Les réglages
  // sont conservés d'un écran à l'autre.
  const [reglages, setReglages] = useStockage('comparateur', () => ({
    idA: protecteur.id,
    retraitA: 48,
    idB: protecteur.id === 'arceau-bleu' ? 'arceau-noir' : 'arceau-bleu',
    retraitB: 0,
  }));
  const { idA, retraitA, idB, retraitB } = reglages;
  const setIdA = (idA: string) => setReglages({ ...reglages, idA });
  const setRetraitA = (retraitA: number) => setReglages({ ...reglages, retraitA });
  const setIdB = (idB: string) => setReglages({ ...reglages, idB });
  const setRetraitB = (retraitB: number) => setReglages({ ...reglages, retraitB });

  const a = evalue(idA, retraitA, facteurPour);
  const b = evalue(idB, retraitB, facteurPour);
  const gagnant = a.effective >= b.effective ? a : b;
  const perdant = gagnant === a ? b : a;
  const renversement = gagnant.nrr < perdant.nrr;

  return (
    <Carte
      titre="Lequel protège vraiment ?"
      source="diapos 13 et 16"
      intro="Le catalogue classe les protecteurs par NRR. Mais le NRR suppose un port parfait. Compare deux protecteurs tels qu'ils sont réellement portés."
    >
      <Ligne
        titre="Protecteur A"
        id={idA}
        onId={setIdA}
        retrait={retraitA}
        onRetrait={setRetraitA}
        effective={a.effective}
      />
      <Ligne
        titre="Protecteur B"
        id={idB}
        onId={setIdB}
        retrait={retraitB}
        onRetrait={setRetraitB}
        effective={b.effective}
      />

      <Resultat
        etiquette="Le mieux protégé"
        valeur={gagnant.nom}
        note={`${nb(gagnant.effective, 1)} dB contre ${nb(perdant.effective, 1)} dB — un écart de ${nb(Math.abs(a.effective - b.effective), 1)} dB`}
        ton="vert"
      />

      {renversement && (
        <Declic>
          <strong>Le NRR le plus faible gagne.</strong> Un protecteur moins
          performant mais gardé en permanence bat un protecteur haut de gamme
          qu'on retire. Le point de bascule se situe autour de{' '}
          <strong>25 minutes de retrait</strong> sur un quart de 8 h. Autrement
          dit : un travailleur qui refuse les bouchons mousse parce qu'ils lui
          font mal, et qui garde un arceau toute la journée, fait le bon choix.
        </Declic>
      )}
    </Carte>
  );
}

function evalue(
  id: string,
  retraitMin: number,
  facteurPour: (p: { type: 'bouchons' | 'coquilles' }) => number,
) {
  const protecteur = protecteurParId(id) ?? bouchons[0]!;
  const nominale = attenuationReelle(protecteur.nrr, facteurPour(protecteur));
  return {
    nom: protecteur.nom,
    nrr: protecteur.nrr,
    effective: attenuationEffective(nominale, 1 - retraitMin / QUART_MIN),
  };
}

function Ligne({
  titre,
  id,
  onId,
  retrait,
  onRetrait,
  effective,
}: {
  titre: string;
  id: string;
  onId: (id: string) => void;
  retrait: number;
  onRetrait: (minutes: number) => void;
  effective: number;
}) {
  return (
    <Champ etiquette={`${titre} — ${nb(effective, 1)} dB effectifs`}>
      <Selecteur
        options={protecteurs}
        valeur={id}
        onChange={onId}
        format={(p) => `${p.nom} — NRR ${p.nrr}`}
        etiquette={titre}
      />
      <Curseur
        min={0}
        max={240}
        pas={1}
        valeur={retrait}
        onChange={onRetrait}
        affichage={formatMinutes(retrait)}
        legende="temps sans protection"
        etiquette={`${titre} — temps sans protection, en minutes`}
        valeursRapides={RETRAITS_RAPIDES}
      />
    </Champ>
  );
}
