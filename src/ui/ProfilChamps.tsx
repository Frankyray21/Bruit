/**
 * Les deux choix qui personnalisent tout le site : mon poste, mon protecteur.
 *
 * Ils écrivent directement dans le profil : réglés une fois, dans n'importe
 * quel outil ou dans « Moi », ils sont repris partout. Un travailleur n'a plus
 * à retrouver son poste dans cinq listes déroulantes.
 */

import { metiers, protecteurs, type Protecteur } from '../data/index.js';
import { useTravailleur } from '../etat/travailleur.js';
import { Champ } from './composants.js';
import { nb } from './format.js';

export function formatMetier(m: { nom: string; niveau_dBA: number }): string {
  return `${m.nom} — ${nb(m.niveau_dBA, 1)} dBA`;
}

export function formatProtecteur(p: Protecteur): string {
  return `${p.nom} — NRR ${p.nrr}`;
}

/**
 * Deux présentations :
 * - `invite` (accueil, « Moi ») : tant que rien n'est choisi, une invite
 *   « Choisis ton poste… » plutôt que le poste type — sinon un travailleur dont
 *   le poste EST le poste type n'aurait aucun moyen de le confirmer.
 * - sans `invite` (dans un outil) : la valeur réellement utilisée par le calcul,
 *   pour que le résultat affiché corresponde toujours au sélecteur.
 */
export function ChampPoste({
  etiquette = 'Mon poste',
  invite = false,
}: {
  etiquette?: string;
  invite?: boolean;
}) {
  const { poste, posteChoisi, majProfil } = useTravailleur();
  const montrerInvite = invite && !posteChoisi;
  return (
    <Champ etiquette={etiquette}>
      <select
        className="choix__select"
        aria-label={etiquette}
        value={montrerInvite ? '' : poste.id}
        onChange={(e) => majProfil({ posteId: e.target.value || null })}
      >
        {montrerInvite && <option value="">Choisis ton poste…</option>}
        {metiers.map((m) => (
          <option key={m.id} value={m.id}>
            {formatMetier(m)}
          </option>
        ))}
      </select>
    </Champ>
  );
}

export function ChampProtecteur({
  etiquette = 'Mon protecteur',
  options = protecteurs,
  invite = false,
}: {
  etiquette?: string;
  options?: readonly Protecteur[];
  invite?: boolean;
}) {
  const { protecteur, protecteurChoisi, majProfil } = useTravailleur();
  const dansListe = options.some((p) => p.id === protecteur.id);
  const montrerInvite = (invite && !protecteurChoisi) || !dansListe;
  const valeur = montrerInvite ? '' : protecteur.id;
  return (
    <Champ etiquette={etiquette}>
      <select
        className="choix__select"
        aria-label={etiquette}
        value={valeur}
        onChange={(e) => majProfil({ protecteurId: e.target.value || null })}
      >
        {montrerInvite && <option value="">Choisis ton protecteur…</option>}
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {formatProtecteur(p)}
          </option>
        ))}
      </select>
    </Champ>
  );
}
