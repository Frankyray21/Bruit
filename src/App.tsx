/**
 * Coquille du site : quatre zones, une barre de navigation, un mode présentation.
 *
 * Le parcours sert le cours, la boîte à outils sert le terrain, et c'est le
 * même site — un travailleur qui a suivi la formation retrouve les mêmes
 * calculateurs au fond de la mine.
 */

import { useState } from 'react';
import { MODULES } from './parcours/modules.js';
import { Quiz } from './quiz/Quiz.js';
import { useProgression, useStockage } from './etat/stockage.js';
import { FournisseurConfig } from './etat/config.js';
import { Avertissement, Carte } from './ui/composants.js';
import { BudgetRetrait } from './outils/BudgetRetrait.js';
import { ComposeurQuart } from './outils/ComposeurQuart.js';
import { Comparateur } from './outils/Comparateur.js';
import { DureePermise, EchelleMetiers } from './outils/DureePermise.js';
import { Protection } from './outils/Protection.js';
import { TempsDePort } from './outils/TempsDePort.js';
import { HeroOreille } from './anim3d/HeroOreille.js';
import { BanniereInstall, CarteInstall } from './ui/InstallerApp.js';

type Zone = 'parcours' | 'outils' | 'quiz' | 'moi';

const ZONES: readonly { id: Zone; nom: string; icone: string }[] = [
  { id: 'parcours', nom: 'Formation', icone: '📘' },
  { id: 'outils', nom: 'Outils', icone: '🧮' },
  { id: 'quiz', nom: 'Quiz', icone: '✓' },
  { id: 'moi', nom: 'Moi', icone: '👷' },
];

export default function App() {
  const [zone, setZone] = useState<Zone>('parcours');
  const [moduleOuvert, setModuleOuvert] = useState<string | null>(null);
  const [presentation, setPresentation] = useStockage('presentation', false);
  const progression = useProgression();

  const module = MODULES.find((m) => m.id === moduleOuvert);

  return (
    <FournisseurConfig>
      <div className={`app${presentation ? ' app--presentation' : ''}`}>
        <a className="lien-evitement" href="#contenu">
          Aller au contenu
        </a>

        {/* Sidebar Machines Roger — sur ordinateur ; masquée sur mobile où la
            barre du bas prend le relais (ergonomie avec des gants). */}
        <aside className="sidebar">
          <div className="sidebar__marque">
            <span className="sidebar__logo">
              <span className="sidebar__barre" aria-hidden="true" />
              Machines Roger
            </span>
            <span className="sidebar__sous">Protection auditive</span>
          </div>

          <nav className="sidebar__nav" aria-label="Navigation principale">
            {ZONES.map((z, i) => (
              <button
                key={z.id}
                type="button"
                className={`sidebar__item${zone === z.id ? ' sidebar__item--actif' : ''}`}
                onClick={() => {
                  setZone(z.id);
                  setModuleOuvert(null);
                }}
              >
                <span className="sidebar__num">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {z.nom}
              </button>
            ))}
          </nav>

          <p className="sidebar__pied">
            Formation SST — Machines Roger International
            <br />
            Version {__VERSION__}
          </p>
        </aside>

        <div className="stage">
          <header className="entete">
            <span className="entete__marque" aria-hidden="true" />
            <span className="entete__titre">
              {module ? module.titre : 'Protection auditive'}
            </span>
            <button
              type="button"
              className="entete__action"
              onClick={() => setPresentation(!presentation)}
              title="Agrandit tout pour la projection en salle"
            >
              {presentation ? 'Mode normal' : 'Projeter'}
            </button>
          </header>

          <main className="contenu" id="contenu">
          <BanniereInstall />

          {zone === 'parcours' &&
            (module ? (
              <div className="lecture">
                <button
                  type="button"
                  className="bouton bouton--secondaire bouton--retour"
                  style={{ marginBottom: 18 }}
                  onClick={() => setModuleOuvert(null)}
                >
                  ← Tous les modules
                </button>

                {module.contenu()}

                <button
                  type="button"
                  className="bouton"
                  onClick={() => {
                    progression.marquerFait(module.id);
                    setModuleOuvert(null);
                  }}
                >
                  J'ai terminé ce module
                </button>
              </div>
            ) : (
              <Parcours
                faits={progression.faits}
                onOuvrir={(id) => setModuleOuvert(id)}
              />
            ))}

          {zone === 'outils' && <BoiteAOutils />}
          {zone === 'quiz' && (
            <div className="lecture">
              <Quiz />
            </div>
          )}
          {zone === 'moi' && (
            <div className="lecture">
              <Moi
                faits={progression.faits}
                onReinitialiser={progression.reinitialiser}
              />
            </div>
          )}

          <p className="pied">
            Estimations pédagogiques calculées à partir des dosimétries de la
            mine. Ne remplace ni une dosimétrie individuelle, ni l'évaluation
            d'un hygiéniste du travail, ni le programme de conservation de
            l'ouïe de l'employeur.
          </p>
          </main>
        </div>

        <nav className="nav">
          {ZONES.map((z) => (
            <button
              key={z.id}
              type="button"
              className={`nav__item${zone === z.id ? ' nav__item--actif' : ''}`}
              onClick={() => {
                setZone(z.id);
                setModuleOuvert(null);
              }}
            >
              <span className="nav__icone" aria-hidden="true">
                {z.icone}
              </span>
              {z.nom}
            </button>
          ))}
        </nav>
      </div>
    </FournisseurConfig>
  );
}

function Parcours({
  faits,
  onOuvrir,
}: {
  faits: readonly string[];
  onOuvrir: (id: string) => void;
}) {
  return (
    <>
      <HeroOreille>
        <h1 style={{ marginBottom: 6 }}>Protection auditive</h1>
        <p className="carte__intro" style={{ marginBottom: 0 }}>
          Six modules, une quinzaine de minutes. Chaque notion se manipule
          plutôt que de se lire.
        </p>
      </HeroOreille>

      <div className="module-liste">
        {MODULES.map((m, i) => (
          <button
            key={m.id}
            type="button"
            className={`module-carte${faits.includes(m.id) ? ' module-carte--fait' : ''}`}
            onClick={() => onOuvrir(m.id)}
          >
            <span className="module-carte__numero">
              {faits.includes(m.id) ? '✓' : i + 1}
            </span>
            <span className="module-carte__texte">
              <span className="module-carte__titre">{m.titre}</span>
              <span className="module-carte__sous">
                {m.sousTitre} · {m.diapos}
              </span>
            </span>
            <span className="module-carte__chevron" aria-hidden="true">
              ›
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function BoiteAOutils() {
  return (
    <>
      <h1 style={{ marginBottom: 6 }}>Boîte à outils</h1>
      <p className="carte__intro">
        Les calculateurs, accessibles directement — sans repasser par le cours.
      </p>
      <div className="grille">
        <BudgetRetrait />
        <TempsDePort />
        <Protection />
        <ComposeurQuart />
        <Comparateur />
        <DureePermise />
        <EchelleMetiers />
      </div>
    </>
  );
}

function Moi({
  faits,
  onReinitialiser,
}: {
  faits: readonly string[];
  onReinitialiser: () => void;
}) {
  const [nom] = useStockage('nom', '');

  return (
    <>
      <h1 style={{ marginBottom: 6 }}>Ma progression</h1>

      <Carte>
        <div className="resultat">
          <div className="resultat__etiquette">Modules complétés</div>
          <div className="resultat__valeur">
            {faits.length} / {MODULES.length}
          </div>
          {nom && <div className="resultat__note">{nom}</div>}
        </div>

        <div className="barres" style={{ marginTop: 14 }}>
          {MODULES.map((m) => (
            <div
              key={m.id}
              className={`barre barre--${faits.includes(m.id) ? 'ok' : 'attention'}`}
            >
              <span>{m.titre}</span>
              <span className="barre__valeur">
                {faits.includes(m.id) ? '✓' : '—'}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="bouton bouton--secondaire"
          onClick={onReinitialiser}
        >
          Recommencer la formation
        </button>
      </Carte>

      <Carte titre="Télécharger l'application">
        <p className="carte__intro">
          Installe le site comme une vraie app. Une fois installé, il fonctionne
          <strong> sans réseau</strong> — au fond, comme en surface.
        </p>
        <CarteInstall />
        <Avertissement>
          Rien ne quitte ton appareil : pas de compte, pas de serveur, aucune
          donnée transmise. Ta progression est stockée localement.
        </Avertissement>
        <p className="carte__source" style={{ marginTop: 12, display: 'block' }}>
          Version {__VERSION__} · se met à jour automatiquement
        </p>
      </Carte>
    </>
  );
}
