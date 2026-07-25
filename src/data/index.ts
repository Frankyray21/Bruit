/**
 * Accès typé aux données de référence.
 *
 * Les JSON de `data/` sont la source de vérité : ils viennent des dosimétries
 * de la mine et de la table réglementaire. Aucune valeur numérique du domaine
 * ne doit être écrite en dur ailleurs que là.
 */

import metiersJson from '../../data/metiers.json';
import protecteursJson from '../../data/protecteurs.json';
import rsstJson from '../../data/rsst-art137.json';
import statistiquesJson from '../../data/statistiques-cnesst.json';

export interface Metier {
  id: string;
  nom: string;
  niveau_dBA: number;
  dureePermise_h: number;
  secteur: string;
}

export interface Tache {
  id: string;
  nom: string;
  niveau_dBA: number;
}

export interface PosteAtelier {
  id: string;
  nom: string;
  leq8h_dBA: number;
  remarque: string;
}

export interface Protecteur {
  id: string;
  nom: string;
  type: 'bouchons' | 'coquilles';
  sousType: string;
  nrr: number;
}

export const metiers: readonly Metier[] = metiersJson.metiers;
export const taches: readonly Tache[] = metiersJson.taches;
export const postesAtelier: readonly PosteAtelier[] = metiersJson.postesAtelier;
export const protecteurs: readonly Protecteur[] =
  protecteursJson.protecteurs as readonly Protecteur[];

export const bouchons = protecteurs.filter((p) => p.type === 'bouchons');
export const coquilles = protecteurs.filter((p) => p.type === 'coquilles');

export const tableRsst = rsstJson.tableau;
export const seuils = rsstJson.seuils;
export const tempsDePortFormation = protecteursJson.tempsDePort;
export const installation = protecteursJson.installation;
export const statistiques = statistiquesJson;

/** Le protecteur le plus performant du catalogue, pour les valeurs par défaut. */
export const meilleurBouchon =
  bouchons.reduce<Protecteur | undefined>(
    (meilleur, p) => (!meilleur || p.nrr > meilleur.nrr ? p : meilleur),
    undefined,
  ) ?? protecteurs[0]!;

export const coquilleParDefaut = coquilles[0] ?? protecteurs[0]!;

export function metierParId(id: string): Metier | undefined {
  return metiers.find((m) => m.id === id);
}

export function protecteurParId(id: string): Protecteur | undefined {
  return protecteurs.find((p) => p.id === id);
}
