/**
 * Outils #26 et #27 — Cumul de carrière et substitution d'équipement.
 *
 * Le cumul n'ajoute aucune science : c'est le compteur du règlement, prolongé.
 * Il ne prédit PAS de perte auditive.
 */

import { useState } from 'react';
import { cumulCarriere } from '../domain/carriere.js';
import { dureePermise, formaterDuree } from '../domain/rsst.js';
import { energieRelative } from '../domain/sources.js';
import { metierParId, metiers, taches } from '../data/index.js';
import {
  Avertissement,
  Carte,
  Champ,
  Curseur,
  Declic,
  Resultat,
  Selecteur,
} from '../ui/composants.js';
import { entier, nb } from '../ui/format.js';

export function Carriere() {
  const [metierId, setMetierId] = useState('foreur-long-trou');
  const [annees, setAnnees] = useState(25);

  const metier = metierParId(metierId) ?? metiers[0]!;
  const cumul = cumulCarriere(
    [{ niveauDBA: metier.niveau_dBA, dureeH: 8 }],
    annees,
  );

  return (
    <Carte
      titre="Sur une carrière"
      source="hors formation"
      intro="Un quart de huit heures à ce poste, sans protection, consomme plusieurs fois la dose quotidienne permise. Voici ce que ça donne sur une carrière."
    >
      <Champ etiquette="Mon poste">
        <Selecteur
          options={metiers}
          valeur={metierId}
          onChange={setMetierId}
          format={(m) => `${m.nom} — ${m.niveau_dBA} dBA`}
        />
      </Champ>

      <Champ etiquette="Années à ce poste">
        <Curseur
          min={1}
          max={40}
          pas={1}
          valeur={annees}
          onChange={setAnnees}
          affichage={`${annees} ans`}
          legende="240 jours travaillés par an"
        />
      </Champ>

      <Resultat
        etiquette="Doses permises consommées par jour"
        valeur={`× ${nb(cumul.dosesParJour, 1)}`}
        note="1,0 = exactement la limite réglementaire d'une journée"
        ton={cumul.dosesParJour > 10 ? 'rouge' : cumul.dosesParJour > 1 ? 'jaune' : 'vert'}
      />

      <Resultat
        etiquette={`Cumul sur ${annees} ans`}
        valeur={entier(cumul.dosesTotales)}
        note="doses réglementaires, sans protection auditive"
      />

      <Avertissement>
        <strong>Ce n'est pas un pronostic médical.</strong> C'est le compteur du
        règlement, prolongé dans le temps. Projeter une perte auditive réelle
        demanderait la norme ISO 1999 — le site ne le fait pas, et ne le fera
        pas avec des coefficients approximés.
      </Avertissement>
    </Carte>
  );
}

export function Substitution() {
  const paires = [
    { avant: 'drill-air-vissage', apres: 'drill-batterie' },
    { avant: 'impact-drill', apres: 'meulage' },
  ];

  return (
    <Carte
      titre="Changer d'outil, pas juste de bouchons"
      source="diapo 8"
      intro="La formation ne parle que d'équipement de protection. Mais ses propres mesures montrent qu'un changement d'outil vaut mieux qu'un meilleur bouchon."
    >
      {paires.map(({ avant, apres }) => {
        const a = taches.find((t) => t.id === avant)!;
        const b = taches.find((t) => t.id === apres)!;
        const gain = a.niveau_dBA - b.niveau_dBA;
        const facteur =
          energieRelative(a.niveau_dBA) / energieRelative(b.niveau_dBA);

        return (
          <div key={avant} className="resultat">
            <div className="resultat__etiquette">
              {a.nom} → {b.nom}
            </div>
            <div className="resultat__valeur">− {gain} dBA</div>
            <div className="resultat__note">
              énergie divisée par {nb(facteur, 1)} · durée permise{' '}
              {formaterDuree(dureePermise(a.niveau_dBA))} →{' '}
              {formaterDuree(dureePermise(b.niveau_dBA))}
            </div>
          </div>
        );
      })}

      <Declic>
        Trois décibels de moins, c'est <strong>deux fois plus de temps</strong>{' '}
        permis à ce poste — sans rien demander au travailleur. C'est ce qu'on
        appelle réduire le bruit à la source, et ça passe avant l'équipement de
        protection dans la hiérarchie des moyens.
      </Declic>
    </Carte>
  );
}
