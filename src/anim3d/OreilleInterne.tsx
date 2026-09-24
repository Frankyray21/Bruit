/**
 * Vue 3D interactive de la cochlée et des cellules ciliées.
 *
 * Module 4 (diapos 11-12). La coquille est le vrai modèle anatomique
 * (`public/models/cochlee.glb`) ; l'organe de Corti est reconstruit le long de
 * la spirale (1 cellule interne + 3 externes par station). Le curseur de bruit
 * couche puis détruit les cellules, en commençant par la zone qui code les
 * aigus — le mécanisme réel de la surdité professionnelle, rendu visible.
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
    const p = creerScene(
      conteneur.current,
      !REDUIT,
      `${import.meta.env.BASE_URL}models/cochlee.glb`,
    );
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
    niveau < 81
      ? { texte: 'Cellules saines — stéréocils en escalier, liens de bout intacts', ton: 'vert' as const }
      : niveau < 92
        ? { texte: 'Premières atteintes — cellules externes de la zone 3–6 kHz, stéréocils désorganisés', ton: 'jaune' as const }
        : niveau < 104
          ? { texte: 'Cellules externes couchées et fusionnées ; les internes commencent à souffrir', ton: 'jaune' as const }
          : { texte: 'Cellules détruites autour de 4 kHz, l’atteinte s’étend aux fréquences voisines', ton: 'rouge' as const };

  return (
    <Carte
      titre="La cochlée sous le bruit"
      source="diapos 11-12"
      intro="La vraie cochlée, vue en transparence, avec son organe de Corti reconstruit le long de la spirale : une cellule ciliée interne et trois externes par rangée, stéréocils en escalier, membrane tectoriale, tunnel de Corti, repères de fréquence. Fais glisser pour tourner. Monte le niveau et regarde la zone de 4 kHz, près de la base."
    >
      <div
        ref={conteneur}
        className="scene3d"
        role="img"
        aria-label={`Vue 3D de la cochlée. État : ${etat.texte}.`}
      />

      <ul className="legende3d" aria-label="Repères du modèle">
        <li>
          <span className="legende3d__pastille" style={{ background: '#7ee787' }} aria-hidden="true" />
          Stéréocils sains
        </li>
        <li>
          <span className="legende3d__pastille" style={{ background: '#f2c14e' }} aria-hidden="true" />
          Sous stress (couchés)
        </li>
        <li>
          <span className="legende3d__pastille" style={{ background: '#ff7a8a' }} aria-hidden="true" />
          Détruits
        </li>
        <li>
          <span className="legende3d__pastille" style={{ background: '#e8b7bd' }} aria-hidden="true" />
          Cochlée (base = aigus, apex = graves ; repères 20 kHz → 250 Hz)
        </li>
        <li>
          <span className="legende3d__pastille" style={{ background: '#f0dfb3' }} aria-hidden="true" />
          Membrane tectoriale
        </li>
      </ul>

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
        fracture. L’ordre est celui qu’on observe au microscope : cellules
        externes avant les internes, première rangée d’abord, encoche à 3–6 kHz
        qui s’élargit ensuite. Deux libertés : les cellules sont grossies (des
        micromètres rendus en dixièmes de millimètre) et le temps est compressé
        — dans la réalité, la destruction se fait sur des mois et des années
        d’exposition, selon la dose (niveau × durée), pas le niveau seul.
      </Avertissement>

      <p className="carte__source carte__source--credit" style={{ marginTop: 12 }}>
        Cochlée :{' '}
        <a href="https://github.com/Z-Anatomy" target="_blank" rel="noopener noreferrer">
          Z-Anatomy
        </a>{' '}
        (CC BY-SA 4.0), d'après « Anatomy of the Inner Ear » (University of Dundee, CC BY-NC-SA
        4.0, d'après 3D Ear, McGill) — usage non commercial. Organe de Corti reconstruit d'après
        l'histologie ; carte des fréquences : Greenwood (1990) ; ordre des atteintes : Bohne et
        Harding (2000), Liberman et Dodds (1984) ; encoche 3–6 kHz : ISO 1999, NIOSH (1998).
      </p>
    </Carte>
  );
}
