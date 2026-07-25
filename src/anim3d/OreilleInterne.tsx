/**
 * Vue 3D interactive de la cochlée et des cellules ciliées.
 *
 * Module 4 (diapos 11-12). Le curseur de bruit couche puis détruit les cellules,
 * en commençant par la zone qui code les aigus — le mécanisme réel de la surdité
 * professionnelle, rendu visible.
 */

import { useEffect, useRef, useState } from 'react';
import { creerScene, type PoigneeScene } from './scene.js';
import { Avertissement, Carte } from '../ui/composants.js';
import { nb } from '../ui/format.js';

/** WebGL est-il disponible ? Sinon on n'essaie même pas de monter la scène. */
function webglDisponible(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const REDUIT =
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function OreilleInterne() {
  const conteneur = useRef<HTMLDivElement>(null);
  const poignee = useRef<PoigneeScene | null>(null);
  const [niveau, setNiveau] = useState(72);
  const [supporte] = useState(webglDisponible);

  useEffect(() => {
    if (!supporte || !conteneur.current) return;
    const p = creerScene(conteneur.current, !REDUIT);
    poignee.current = p;
    p.setNiveau(niveau);

    // Glissement pour tourner la cochlée.
    const el = conteneur.current;
    let dernier: { x: number; y: number } | null = null;
    const bas = (e: PointerEvent) => {
      dernier = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const bouge = (e: PointerEvent) => {
      if (!dernier) return;
      p.tourner(e.clientX - dernier.x, e.clientY - dernier.y);
      dernier = { x: e.clientX, y: e.clientY };
    };
    const haut = () => {
      dernier = null;
    };
    el.addEventListener('pointerdown', bas);
    el.addEventListener('pointermove', bouge);
    el.addEventListener('pointerup', haut);
    el.addEventListener('pointercancel', haut);

    return () => {
      el.removeEventListener('pointerdown', bas);
      el.removeEventListener('pointermove', bouge);
      el.removeEventListener('pointerup', haut);
      el.removeEventListener('pointercancel', haut);
      p.detruire();
      poignee.current = null;
    };
    // La scène ne se recrée pas au changement de niveau : on la pilote par ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supporte]);

  useEffect(() => {
    poignee.current?.setNiveau(niveau);
  }, [niveau]);

  if (!supporte) {
    return (
      <Carte titre="La cochlée sous le bruit" source="diapos 11-12">
        <Avertissement>
          Ton navigateur n'affiche pas la 3D. Le message reste le même : le bruit
          détruit les cellules ciliées de l'oreille interne, et cette perte est{' '}
          <strong>irréversible</strong>.
        </Avertissement>
      </Carte>
    );
  }

  const etat =
    niveau < 82
      ? { texte: 'Cellules saines — stéréocils dressés', ton: 'vert' as const }
      : niveau < 100
        ? { texte: 'Cellules sous stress — les faisceaux s’affaissent', ton: 'jaune' as const }
        : { texte: 'Cellules détruites — la zone des aigus s’efface', ton: 'rouge' as const };

  return (
    <Carte
      titre="La cochlée sous le bruit"
      source="diapos 11-12"
      intro="Fais glisser pour tourner. Monte le niveau de bruit et regarde les cellules ciliées — d’abord dans la zone des aigus."
    >
      <div
        ref={conteneur}
        className="scene3d"
        role="img"
        aria-label={`Vue 3D de la cochlée. État : ${etat.texte}.`}
      />

      <div className={`resultat resultat--${etat.ton}`} style={{ marginTop: 12 }}>
        <div className="resultat__etiquette">Niveau de bruit</div>
        <div className="resultat__valeur">{niveau} dBA</div>
        <div className="resultat__note">{etat.texte}</div>
      </div>

      <input
        type="range"
        min={60}
        max={115}
        step={1}
        value={niveau}
        onChange={(e) => setNiveau(Number(e.target.value))}
        aria-label="Niveau de bruit en décibels"
        style={{ marginTop: 8 }}
      />

      <div className="ajouts">
        <button type="button" className="choix__option" onClick={() => setNiveau(72)}>
          Bureau calme (72)
        </button>
        <button type="button" className="choix__option" onClick={() => setNiveau(97)}>
          Foreur long trou (97,8)
        </button>
        <button type="button" className="choix__option" onClick={() => setNiveau(115)}>
          Jackleg (114,9)
        </button>
      </div>

      <Avertissement>
        Une cellule ciliée détruite <strong>ne repousse jamais</strong>. Ce que
        cette vue montre ne se répare pas — contrairement à une coupure ou une
        fracture. C’est une illustration schématique, pas un examen médical, et
        elle exagère l’échelle du temps : dans la réalité, la destruction se fait
        sur des mois et des années d’exposition.
      </Avertissement>
    </Carte>
  );
}
