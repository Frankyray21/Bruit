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
 * Tant que rien n'est choisi, le sélecteur affiche une invite plutôt que le
 * poste type : sinon, un travailleur dont le poste EST le poste type n'aurait
 * aucun moyen de le confirmer (aucun changement, donc aucun onChange).
 */
export function ChampPoste({ etiquette = 'Mon poste' }: { etiquette?: string }) {
  const { poste, posteChoisi, majProfil } = useTravailleur();
  return (
    <Champ etiquette={etiquette}>
      <select
        className="choix__select"
        aria-label={etiquette}
        value={posteChoisi ? poste.id : ''}
        onChange={(e) => majProfil({ posteId: e.target.value || null })}
      >
        {!posteChoisi && <option value="">Choisis ton poste…</option>}
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
}: {
  etiquette?: string;
  options?: readonly Protecteur[];
}) {
  const { protecteur, protecteurChoisi, majProfil } = useTravailleur();
  const dansListe = options.some((p) => p.id === protecteur.id);
  const valeur = protecteurChoisi && dansListe ? protecteur.id : '';
  return (
    <Champ etiquette={etiquette}>
      <select
        className="choix__select"
        aria-label={etiquette}
        value={valeur}
        onChange={(e) => majProfil({ protecteurId: e.target.value || null })}
      >
        {valeur === '' && <option value="">Choisis ton protecteur…</option>}
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {formatProtecteur(p)}
          </option>
        ))}
      </select>
    </Champ>
  );
}
