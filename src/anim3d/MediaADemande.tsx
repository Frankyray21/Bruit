import { Suspense, useState, type ReactNode } from 'react';
import { Carte } from '../ui/composants.js';

/** Démonstrations facultatives : pas de rendu 3D ni de mouvement avant le clic. */
export function MediaADemande({ titre, children }: { titre: string; children: ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  return <section className="media-demande" aria-label={titre}>
    {!ouvert ? <Carte titre={titre} intro="Une illustration interactive à explorer à votre rythme. Aucun son n’est émis.">
      <button className="bouton bouton--secondaire" onClick={() => setOuvert(true)}>Ouvrir la vue 3D</button>
    </Carte> : <>
      <button className="bouton bouton--secondaire" onClick={() => setOuvert(false)}>Fermer la vue 3D</button>
      <Suspense fallback={<p role="status">Chargement de la vue 3D…</p>}>{children}</Suspense>
    </>}
  </section>;
}
