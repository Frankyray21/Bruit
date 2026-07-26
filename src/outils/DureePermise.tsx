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
  tonNiveau,
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

      {niveau >= 105 && (
        <Avertissement>
          <strong>Passé un certain niveau, ce n'est plus une question de
          minutes.</strong>{' '}
          Aucune norme n'autorise l'exposition continue au-delà d'environ{' '}
          <strong>115 dBA</strong>, ni les bruits d'impact au-delà de{' '}
          <strong>140 dB (crête)</strong> — quelle que soit la durée. À ces
          niveaux, l'exposition doit être réduite à la source, pas seulement
          chronométrée.
        </Avertissement>
      )}
    </Carte>
  );
}

const ECHELLE_MIN = 80;
const ECHELLE_MAX = 116;

/** Position (0-100 %) d'un niveau sur l'échelle 80-116 dBA. */
function positionEchelle(dBA: number): number {
  const borne = Math.max(ECHELLE_MIN, Math.min(ECHELLE_MAX, dBA));
  return ((borne - ECHELLE_MIN) / (ECHELLE_MAX - ECHELLE_MIN)) * 100;
}

export function EchelleMetiers() {
  const [selection, setSelection] = useState<string | null>(null);
  const tries = [...metiers].sort((a, b) => b.niveau_dBA - a.niveau_dBA);

  return (
    <Carte
      titre="Mon métier sur l'échelle"
      source="diapo 7"
      intro="Chaque poste mesuré, placé sur l'échelle des dBA. La ligne des 85 dBA, c'est la norme — les treize la dépassent. Touche un poste pour voir sa durée permise."
    >
      <div className="echelle" role="group" aria-label="Les treize postes sur l'échelle des dBA, du plus bruyant au moins bruyant">
        <div className="echelle__axe" aria-hidden="true">
          <span
            className="echelle__repere echelle__repere--norme"
            style={{ left: `${positionEchelle(85)}%` }}
          >
            85 · norme
          </span>
          <span className="echelle__repere" style={{ left: `${positionEchelle(105)}%` }}>
            105
          </span>
        </div>

        {tries.map((m) => {
          const ton = tonNiveau(m.niveau_dBA);
          const actif = selection === m.id;
          const dansTable = tableRsst.some(
            (l) => l.niveau_dBA === Math.round(m.niveau_dBA * 10) / 10,
          );
          return (
            <button
              key={m.id}
              type="button"
              className={`echelle__ligne${actif ? ' echelle__ligne--actif' : ''}`}
              aria-pressed={actif}
              onClick={() => setSelection(actif ? null : m.id)}
            >
              <span className="echelle__nom">{m.nom}</span>
              <span className="echelle__val">{nb(m.niveau_dBA, 1)} dBA</span>
              <span className="echelle__piste" aria-hidden="true">
                <span className="echelle__norme" style={{ left: `${positionEchelle(85)}%` }} />
                <span
                  className="echelle__norme echelle__norme--faible"
                  style={{ left: `${positionEchelle(105)}%` }}
                />
                <span
                  className={`echelle__point echelle__point--${ton}`}
                  style={{ left: `${positionEchelle(m.niveau_dBA)}%` }}
                />
              </span>
              {actif && (
                <span className="echelle__note">
                  durée permise sans protection :{' '}
                  <strong>{formaterDuree(dureePermise(m.niveau_dBA))}</strong>
                  {dansTable ? '' : ' (extrapolée)'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Declic>
        <strong>Treize postes sur treize dépassent 85 dBA.</strong> Aucun poste
        souterrain mesuré n'est sûr sans protection — pas même celui du
        superviseur.
      </Declic>

      <p className="carte__intro" style={{ marginTop: 12, marginBottom: 0, fontSize: '0.8rem' }}>
        Ces valeurs sont des dosimétries de postes types, à ± 1 à 2 dBA près :
        deux postes proches (99,5 et 100,1) ne sont pas vraiment distinguables.
      </p>
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
