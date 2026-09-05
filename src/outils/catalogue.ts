export const OUTILS = [
  { id: 'quart', titre: 'Composer mon quart', description: 'Rassembler mes tâches et leurs durées.', groupe: 'Exposition', mots: 'dose cumul metier travail' },
  { id: 'duree', titre: 'Estimer une durée', description: 'Explorer le lien entre niveau sonore et durée.', groupe: 'Exposition', mots: 'temps decibel limite' },
  { id: 'metiers', titre: 'Explorer les métiers', description: 'Retrouver les mesures présentées dans la formation.', groupe: 'Exposition', mots: 'mine foreur mecanicien niveaux' },
  { id: 'protection', titre: 'Choisir une protection', description: 'Comparer les bouchons, les coquilles et leur combinaison.', groupe: 'Protection', mots: 'nrr attenuation double' },
  { id: 'port', titre: 'Comprendre le temps de port', description: 'Voir l’effet des périodes sans protection.', groupe: 'Protection', mots: 'minutes retirer bouchons' },
  { id: 'retrait', titre: 'Simuler un retrait', description: 'Observer comment la dose change sans protecteur.', groupe: 'Protection', mots: 'budget pause minutes' },
  { id: 'comparateur', titre: 'Comparer deux situations', description: 'Mettre deux scénarios côte à côte.', groupe: 'Comprendre', mots: 'metier avant apres' },
  { id: 'sources', titre: 'Additionner les sources', description: 'Combiner plusieurs sources de bruit.', groupe: 'Comprendre', mots: 'sommation energie decibel' },
  { id: 'carriere', titre: 'Voir l’effet sur une carrière', description: 'Explorer l’exposition cumulée dans le temps.', groupe: 'Comprendre', mots: 'annees jours duree' },
  { id: 'pose', titre: 'Vérifier les bons gestes', description: 'Revoir la pose des bouchons et la vérification des coquilles.', groupe: 'Protection', mots: 'installation ajustement' },
] as const;
export type OutilId = typeof OUTILS[number]['id'];
export const GROUPES = ['Tous', 'Exposition', 'Protection', 'Comprendre'] as const;
export function normaliserRecherche(texte: string): string {
  return texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
export function filtrerOutils(recherche: string, groupe: string = 'Tous') {
  const mots = normaliserRecherche(recherche).trim().split(/\s+/).filter(Boolean);
  return OUTILS.filter(outil => (groupe === 'Tous' || outil.groupe === groupe) &&
    mots.every(mot => normaliserRecherche(`${outil.titre} ${outil.description} ${outil.mots}`).includes(mot)));
}
