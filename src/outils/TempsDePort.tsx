/**
 * Outil #9 — Curseur de temps de port. L'écran signature du site.
 *
 * Diapo 16. L'entrée est en MINUTES DE RETRAIT et non en pourcentage :
 * « 98 % » est abstrait, « j'ai enlevé mes bouchons 10 minutes » est vécu.
 */

import { useState } from 'react';
import {
  attenuationEffective,
  attenuationReelle,
} from '../domain/protection.js';
import { bouchons, protecteurParId } from '../data/index.js';
import { useConfig } from '../etat/config.js';
import { Carte, Champ, Curseur, Declic, Resultat, Selecteur } from '../ui/composants.js';
import { nb } from '../ui/format.js';

const QUART_MIN = 8 * 60;

export function TempsDePort() {
  const { facteurBouchons } = useConfig();
  const [protecteurId, setProtecteurId] = useState('howard-leight-max');
  const [minutesRetrait, setMinutesRetrait] = useState(0);

  const protecteur = protecteurParId(protecteurId) ?? bouchons[0]!;
  const nominale = attenuationReelle(protecteur.nrr, facteurBouchons);

  const tempsDePort = 1 - minutesRetrait / QUART_MIN;
  const effective = attenuationEffective(nominale, tempsDePort);
  const perdu = nominale - effective;
  const partPerdue = nominale > 0 ? (perdu / nominale) * 100 : 0;

  return (
    <Carte
      titre="Combien coûte un retrait ?"
      source="diapo 16"
      intro="Enlever sa protection quelques minutes ne coûte pas quelques minutes de protection. L'énergie sonore reçue pendant ce laps de temps écrase tout le reste du quart."
    >
      <Champ etiquette="Protecteur">
        <Selecteur
          options={bouchons}
          valeur={protecteurId}
          onChange={setProtecteurId}
          format={(p) => `${p.nom} — NRR ${p.nrr}`}
        />
      </Champ>

      <Champ etiquette="Temps sans protection sur un quart de 8 h">
        <Curseur
          min={0}
          max={240}
          pas={1}
          valeur={minutesRetrait}
          onChange={setMinutesRetrait}
          affichage={formatMinutes(minutesRetrait)}
          legende={`porté ${nb((tempsDePort * 100), 1)} % du quart`}
        />
      </Champ>

      <Resultat
        etiquette="Protection réellement obtenue"
        valeur={`${nb(effective, 1)} dB`}
        note={`au lieu de ${nb(nominale, 1)} dB si le protecteur est porté en tout temps`}
        ton={partPerdue > 50 ? 'rouge' : partPerdue > 25 ? 'jaune' : 'vert'}
      />

      {minutesRetrait > 0 && (
        <Resultat
          etiquette="Protection perdue"
          valeur={`${nb(partPerdue, 0)} %`}
          note={`${nb(perdu, 1)} dB envolés pour ${formatMinutes(minutesRetrait)} sans protection`}
        />
      )}

      <Declic>
        Dix minutes sur huit heures, c'est <strong>2 % du quart</strong> — et
        près de la <strong>moitié de la protection</strong> de la journée.
        Au-delà de 50 % de temps de port, l'atténuation plafonne à 3 dB : à ce
        stade, le choix du protecteur ne compte plus du tout.
      </Declic>
    </Carte>
  );
}

export function formatMinutes(minutes: number): string {
  if (minutes === 0) return 'jamais retiré';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}
