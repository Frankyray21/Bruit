/**
 * Les deux choix qui personnalisent tout le site : mon poste, mon protecteur.
 *
 * Ils écrivent directement dans le profil : réglés une fois, dans n'importe
 * quel outil ou dans « Moi », ils sont repris partout. Un travailleur n'a plus
 * à retrouver son poste dans cinq listes déroulantes.
 */

import { metiers, protecteurs, type Protecteur } from '../data/index.js';
import { useTravailleur } from '../etat/travailleur.js';
import { Champ, Selecteur } from './composants.js';
import { nb } from './format.js';

export function formatMetier(m: { nom: string; niveau_dBA: number }): string {
  return `${m.nom} — ${nb(m.niveau_dBA, 1)} dBA`;
}

export function formatProtecteur(p: Protecteur): string {
  return `${p.nom} — NRR ${p.nrr}`;
}

export function ChampPoste({ etiquette = 'Mon poste' }: { etiquette?: string }) {
  const { poste, majProfil } = useTravailleur();
  return (
    <Champ etiquette={etiquette}>
      <Selecteur
        options={metiers}
        valeur={poste.id}
        onChange={(id) => majProfil({ posteId: id })}
        format={formatMetier}
        etiquette={etiquette}
      />
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
  const { protecteur, majProfil } = useTravailleur();
  // Si le protecteur du profil n'est pas dans la liste proposée (par ex. des
  // coquilles dans un outil réservé aux bouchons), on affiche le premier de la
  // liste sans écraser le profil.
  const valeur = options.some((p) => p.id === protecteur.id)
    ? protecteur.id
    : (options[0]?.id ?? protecteur.id);
  return (
    <Champ etiquette={etiquette}>
      <Selecteur
        options={options}
        valeur={valeur}
        onChange={(id) => majProfil({ protecteurId: id })}
        format={formatProtecteur}
        etiquette={etiquette}
      />
    </Champ>
  );
}
