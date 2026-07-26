/**
 * Hero d'accueil — la cochlée 3D en fond, le titre par-dessus.
 *
 * Le titre et le sous-titre s'affichent immédiatement (HTML simple) ; la 3D
 * (Three.js) est chargée en différé et apparaît en fondu derrière, sans jamais
 * bloquer l'accueil. Un voile dégradé garantit la lisibilité du texte.
 */

import { lazy, Suspense, type ReactNode } from 'react';

const HeroCanvas = lazy(() => import('./HeroCanvas.js'));

export function HeroOreille({ children }: { children: ReactNode }) {
  return (
    <section className="hero">
      <div className="hero__media">
        <Suspense fallback={null}>
          <HeroCanvas />
        </Suspense>
        <div className="hero__voile" />
      </div>
      <div className="hero__contenu">{children}</div>
    </section>
  );
}
