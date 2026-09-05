export type Zone = 'parcours' | 'outils' | 'quiz' | 'moi';
export interface Route { zone: Zone; module?: string; outil?: string }
export function lireRoute(hash: string, modules: readonly string[], outils: readonly string[]): Route {
  const [zone, id, extra] = hash.replace(/^#\/?/, '').split('/');
  if (extra !== undefined) return { zone: 'parcours' };
  if (zone === 'formation' && id && modules.includes(id)) return { zone: 'parcours', module: id };
  if (zone === 'outils') return id && outils.includes(id) ? { zone: 'outils', outil: id } : { zone: 'outils' };
  if (zone === 'quiz' && !id) return { zone: 'quiz' };
  if (zone === 'suivi' && !id) return { zone: 'moi' };
  return { zone: 'parcours' };
}
export function hashRoute(route: Route): string {
  if (route.zone === 'parcours') return '#formation' + (route.module ? '/' + route.module : '');
  if (route.zone === 'outils') return '#outils' + (route.outil ? '/' + route.outil : '');
  return route.zone === 'quiz' ? '#quiz' : '#suivi';
}
export function prochainModule(ids: readonly string[], faits: readonly string[], dernier = ''): string | undefined {
  if (ids.includes(dernier) && !faits.includes(dernier)) return dernier;
  return ids.find(id => !faits.includes(id)) ?? ids[0];
}
