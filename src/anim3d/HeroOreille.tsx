import { useState } from 'react';
import { Carte } from '../ui/composants.js';
import { CreditSketchfab, SKETCHFAB_PAGE, SKETCHFAB_SRC, useSketchfab } from './sketchfab.js';

/** Le lecteur externe ne reçoit aucune requête avant une action explicite. */
export function HeroOreille() {
  const [actif, setActif] = useState(false);
  const etat = useSketchfab(actif);
  return <Carte titre="Explorer l’oreille complète" source="3D · ressource externe">
    <p className="carte__intro">Le modèle anatomique Sketchfab nécessite une connexion et charge du contenu externe. La vue schématique de la cochlée reste disponible plus haut sans ce service.</p>
    <button className="bouton bouton--secondaire" aria-expanded={actif} onClick={() => setActif(!actif)}>{actif ? 'Fermer le modèle externe' : 'Charger le modèle Sketchfab'}</button>
    {actif && etat === 'verification' && <p role="status">Connexion au modèle…</p>}
    {actif && etat === 'joignable' && <iframe className="modele-externe" title="Coupe de l’oreille en 3D — Sketchfab" src={SKETCHFAB_SRC} allowFullScreen allow="fullscreen" style={{ width: '100%', height: 400, border: 0, marginTop: 16 }} />}
    {actif && etat === 'indisponible' && <p role="status">Le modèle externe ne répond pas. Vous pouvez continuer la formation ou réessayer plus tard.</p>}
    {actif && <p><a href={SKETCHFAB_PAGE} target="_blank" rel="noopener noreferrer">Ouvrir directement sur Sketchfab ↗</a></p>}
    <CreditSketchfab className="carte__source" />
  </Carte>;
}
