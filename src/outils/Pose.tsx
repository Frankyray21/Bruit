/**
 * Outils #20, #21 et #22 — Pose des bouchons, vérification des coquilles,
 * symptômes d'alerte.
 *
 * Diapos 15 et 12. Mettre ses bouchons est une compétence motrice avec un
 * critère de réussite, pas une intention.
 */

import { useEffect, useState } from 'react';
import { installation } from '../data/index.js';
import { Avertissement, Carte, Declic, Verdict } from '../ui/composants.js';

const ATTENTE_S = 10;

export function PoseBouchons() {
  const [etape, setEtape] = useState(0);
  const [chrono, setChrono] = useState<number | null>(null);

  useEffect(() => {
    if (chrono === null) return;
    if (chrono <= 0) {
      setEtape(3);
      setChrono(null);
      return;
    }
    const t = setTimeout(() => setChrono(chrono - 1), 1000);
    return () => clearTimeout(t);
  }, [chrono]);

  const etapes = installation.bouchons;

  return (
    <Carte
      titre="Poser ses bouchons"
      source="diapo 15"
      intro="Trois gestes, dans l'ordre. Un bouchon mal posé perd bien plus que ce que le choix du modèle peut apporter."
    >
      {etapes.map((texte, i) => (
        <div
          key={i}
          className={`etape${i === etape ? ' etape--active' : ''}${i < etape ? ' etape--faite' : ''}`}
        >
          <span className="etape__numero">{i < etape ? '✓' : i + 1}</span>
          <span>{texte}</span>
        </div>
      ))}

      {chrono !== null && (
        <>
          <div className="chrono">{chrono} s</div>
          <p className="carte__intro" style={{ textAlign: 'center' }}>
            Garde le doigt sur le bouchon, laisse-le se gonfler.
          </p>
        </>
      )}

      {etape < 2 && chrono === null && (
        <button type="button" className="bouton" onClick={() => setEtape(etape + 1)}>
          Geste {etape + 1} fait
        </button>
      )}

      {etape === 2 && chrono === null && (
        <button
          type="button"
          className="bouton"
          onClick={() => setChrono(ATTENTE_S)}
        >
          Démarrer les {ATTENTE_S} secondes d'attente
        </button>
      )}

      {etape === 3 && (
        <>
          <Verdict
            niveau="jaune"
            message="Vérification : le bout du bouchon ne doit pas être visible de face"
          />
          <Declic>
            C'est le <strong>seul critère objectif</strong> de toute la
            formation. Si tu vois le bout du bouchon dans un miroir, il n'est
            pas assez enfoncé — et le NRR affiché sur la boîte ne veut plus rien
            dire.
          </Declic>
          <button
            type="button"
            className="bouton bouton--secondaire"
            onClick={() => setEtape(0)}
          >
            Recommencer
          </button>
        </>
      )}
    </Carte>
  );
}

export function VerifCoquilles() {
  const [faits, setFaits] = useState<number[]>([]);

  return (
    <Carte titre="Vérifier ses coquilles" source="diapo 15">
      {installation.coquilles.map((texte, i) => (
        <button
          key={i}
          type="button"
          className={`quiz__option${faits.includes(i) ? ' quiz__option--juste' : ''}`}
          onClick={() =>
            setFaits(
              faits.includes(i) ? faits.filter((f) => f !== i) : [...faits, i],
            )
          }
        >
          {faits.includes(i) ? '✓ ' : '○ '}
          {texte}
        </button>
      ))}
    </Carte>
  );
}

const SYMPTOMES = [
  "Sensation d'oreille bouchée",
  "Douleur à l'oreille",
  'Fatigue auditive en fin de quart',
  "Bourdonnement ou sifflement, même au calme",
  'Difficulté à suivre une conversation dans le bruit',
];

export function Symptomes() {
  const [coches, setCoches] = useState<number[]>([]);

  return (
    <Carte
      titre="Symptômes d'alerte"
      source="diapo 12"
      intro="Coche ce que tu ressens. Cet écran n'établit aucun diagnostic — il te dit seulement quand aller voir quelqu'un."
    >
      {SYMPTOMES.map((s, i) => (
        <button
          key={i}
          type="button"
          className={`quiz__option${coches.includes(i) ? ' quiz__option--faux' : ''}`}
          onClick={() =>
            setCoches(
              coches.includes(i) ? coches.filter((c) => c !== i) : [...coches, i],
            )
          }
        >
          {coches.includes(i) ? '● ' : '○ '}
          {s}
        </button>
      ))}

      {coches.length > 0 && (
        <Verdict
          niveau={coches.length >= 2 ? 'rouge' : 'jaune'}
          message={
            coches.length >= 2
              ? "Va voir l'infirmerie — plusieurs signes d'alerte présents"
              : "Signale-le à l'infirmerie lors de ton prochain passage"
          }
        />
      )}

      <Avertissement>
        <strong>Ceci n'est pas un test auditif.</strong> Seul un audiogramme
        posé par un professionnel peut établir une perte auditive. La surdité
        progressive est <strong>irréversible</strong> : plus tôt elle est
        constatée, plus tôt l'exposition peut être corrigée.
      </Avertissement>
    </Carte>
  );
}
