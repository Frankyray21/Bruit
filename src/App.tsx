/**
 * Coquille du site : quatre zones, une barre de navigation, un mode présentation.
 *
 * Le parcours sert le cours, la boîte à outils sert le terrain, et c'est le
 * même site — un travailleur qui a suivi la formation retrouve les mêmes
 * calculateurs au fond de la mine. La zone et le module ouverts sont
 * mémorisés : on reprend où on était, même après une mise à jour.
 */

import { useEffect, useState } from 'react';
import { MODULES, type Module } from './parcours/modules.js';
import { ValidationModule } from './parcours/Validation.js';
import { formaterDate, Quiz } from './quiz/Quiz.js';
import { effacerTout, useStockage } from './etat/stockage.js';
import { FournisseurConfig } from './etat/config.js';
import { FournisseurTravailleur, useTravailleur } from './etat/travailleur.js';
import { Avertissement, Carte, Champ, Choix } from './ui/composants.js';
import { ChampPoste, ChampProtecteur } from './ui/ProfilChamps.js';
import { BudgetRetrait } from './outils/BudgetRetrait.js';
import { ComposeurQuart } from './outils/ComposeurQuart.js';
import { Comparateur } from './outils/Comparateur.js';
import { DureePermise, EchelleMetiers } from './outils/DureePermise.js';
import { FacteurDerating, Protection } from './outils/Protection.js';
import { TempsDePort } from './outils/TempsDePort.js';
import { Carriere } from './outils/Carriere.js';
import { HeroOreille } from './anim3d/HeroOreille.js';
import { BanniereInstall, CarteInstall } from './ui/InstallerApp.js';

type Zone = 'parcours' | 'outils' | 'quiz' | 'moi';

const ZONES: readonly { id: Zone; nom: string; titre: string; icone: string }[] = [
  { id: 'parcours', nom: 'Formation', titre: 'Protection auditive', icone: '📘' },
  { id: 'outils', nom: 'Outils', titre: 'Boîte à outils', icone: '🧮' },
  { id: 'quiz', nom: 'Quiz', titre: 'Quiz', icone: '✓' },
  { id: 'moi', nom: 'Moi', titre: 'Moi', icone: '👷' },
];

export default function App() {
  return (
    <FournisseurConfig>
      <FournisseurTravailleur>
        <Coquille />
      </FournisseurTravailleur>
    </FournisseurConfig>
  );
}

function Coquille() {
  const [zoneBrute, setZone] = useStockage<Zone>('zone', 'parcours');
  const [moduleOuvert, setModuleOuvert] = useStockage<string | null>('module-ouvert', null);
  const [presentation, setPresentation] = useStockage('presentation', false);
  const { marquerFait } = useTravailleur();

  const zone: Zone = ZONES.some((z) => z.id === zoneBrute) ? zoneBrute : 'parcours';
  const indexModule = MODULES.findIndex((m) => m.id === moduleOuvert);
  const module = zone === 'parcours' && indexModule >= 0 ? MODULES[indexModule] : undefined;
  const suivant = module ? MODULES[indexModule + 1] : undefined;

  // À chaque changement d'écran (zone ou module), on repart du haut : sans
  // ça, ouvrir le module 6 depuis le bas de la liste atterrissait au milieu du
  // module, et passer à « Outils » arrivait tout en bas de la boîte à outils.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.getElementById('contenu')?.focus({ preventScroll: true });
  }, [zone, moduleOuvert]);

  // Le titre de l'onglet suit l'écran : utile au lecteur d'écran, et pour
  // retrouver l'app parmi les onglets ouverts.
  useEffect(() => {
    const zoneNom = ZONES.find((z) => z.id === zone)?.nom ?? 'Formation';
    document.title = module
      ? `${indexModule + 1}. ${module.titre} — Protection auditive`
      : `${zoneNom} — Protection auditive`;
  }, [zone, module, indexModule]);

  // En projection, le formateur avance au clavier : → module suivant,
  // ← précédent, Échap = liste. Les champs gardent leurs propres flèches.
  useEffect(() => {
    if (!presentation) return;
    const surTouche = (e: KeyboardEvent) => {
      const cible = e.target;
      if (cible instanceof HTMLElement && /^(INPUT|SELECT|TEXTAREA)$/.test(cible.tagName)) return;
      if (zone !== 'parcours') return;
      if (e.key === 'ArrowRight') {
        const prochain = indexModule < 0 ? MODULES[0] : MODULES[indexModule + 1];
        if (prochain) setModuleOuvert(prochain.id);
      } else if (e.key === 'ArrowLeft') {
        if (indexModule > 0) setModuleOuvert(MODULES[indexModule - 1]!.id);
        else if (indexModule === 0) setModuleOuvert(null);
      } else if (e.key === 'Escape') {
        setModuleOuvert(null);
      }
    };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [presentation, zone, indexModule, setModuleOuvert]);

  function allerA(z: Zone) {
    setZone(z);
    setModuleOuvert(null);
  }

  function ouvrirModule(id: string) {
    setZone('parcours');
    setModuleOuvert(id);
  }

  function terminerModule() {
    if (!module) return;
    marquerFait(module.id);
    if (suivant) setModuleOuvert(suivant.id);
    else allerA('quiz');
  }

  const titreZone = ZONES.find((z) => z.id === zone)?.titre ?? 'Protection auditive';

  return (
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
              aria-current={zone === z.id ? 'page' : undefined}
              onClick={() => allerA(z.id)}
            >
              <span className="sidebar__num">{String(i + 1).padStart(2, '0')}</span>
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
          {module ? (
            <button
              type="button"
              className="entete__retour"
              onClick={() => setModuleOuvert(null)}
              aria-label="Retour à la liste des modules"
            >
              ←
            </button>
          ) : (
            <span className="entete__marque" aria-hidden="true" />
          )}
          <span className="entete__titre">
            {module ? (
              <>
                <span className="entete__kicker">
                  Module {indexModule + 1} / {MODULES.length}
                </span>
                {module.titre}
              </>
            ) : (
              titreZone
            )}
          </span>
          <button
            type="button"
            className={`entete__action${presentation ? '' : ' entete__action--bureau'}`}
            onClick={() => setPresentation(!presentation)}
            title="Agrandit tout pour la projection en salle"
          >
            {presentation ? 'Mode normal' : 'Projeter'}
          </button>
        </header>
        {module && (
          <div className="entete__progression" aria-hidden="true">
            <span style={{ width: `${((indexModule + 1) / MODULES.length) * 100}%` }} />
          </div>
        )}

        <main className="contenu" id="contenu" tabIndex={-1}>
          <BanniereInstall />

          {zone === 'parcours' &&
            (module ? (
              <ModulePage
                module={module}
                suivant={suivant}
                onRetour={() => setModuleOuvert(null)}
                onTerminer={terminerModule}
              />
            ) : (
              <Parcours onOuvrir={ouvrirModule} onQuiz={() => allerA('quiz')} />
            ))}

          {zone === 'outils' && <BoiteAOutils onProfil={() => allerA('moi')} />}
          {zone === 'quiz' && <Quiz onRevoir={ouvrirModule} onFormation={() => allerA('parcours')} />}
          {zone === 'moi' && (
            <Moi
              onOuvrir={ouvrirModule}
              onQuiz={() => allerA('quiz')}
              presentation={presentation}
              setPresentation={setPresentation}
            />
          )}

          <p className="pied">
            Estimations pédagogiques calculées à partir des dosimétries de la
            mine. Ne remplace ni une dosimétrie individuelle, ni l'évaluation
            d'un hygiéniste du travail, ni le programme de conservation de
            l'ouïe de l'employeur.
          </p>
        </main>
      </div>

      <nav className="nav" aria-label="Navigation principale">
        {ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            className={`nav__item${zone === z.id ? ' nav__item--actif' : ''}`}
            aria-current={zone === z.id ? 'page' : undefined}
            onClick={() => allerA(z.id)}
          >
            <span className="nav__icone" aria-hidden="true">
              {z.icone}
            </span>
            {z.nom}
          </button>
        ))}
      </nav>
    </div>
  );
}

/** Un module ouvert : son contenu, sa question de validation, la suite. */
function ModulePage({
  module,
  suivant,
  onRetour,
  onTerminer,
}: {
  module: Module;
  suivant: Module | undefined;
  onRetour: () => void;
  onTerminer: () => void;
}) {
  const { validations } = useTravailleur();
  const valide = module.id in validations;

  return (
    <>
      <div className="module__en-tete">
        <span className="carte__source">
          {module.duree} · {module.diapos}
        </span>
        <p className="module__objectif">{module.objectif}</p>
      </div>

      {module.contenu()}

      <ValidationModule module={module} />

      <div className="module-fin">
        {!valide && (
          <p className="module-fin__aide" role="status">
            Réponds à la question ci-dessus pour terminer le module.
          </p>
        )}
        <button type="button" className="bouton" disabled={!valide} onClick={onTerminer}>
          {suivant ? (
            <>
              Terminé — module suivant
              <span className="bouton__sous">{suivant.titre}</span>
            </>
          ) : (
            <>
              Terminé — passer au quiz
              <span className="bouton__sous">14 questions, attestation à la clé</span>
            </>
          )}
        </button>
        <button type="button" className="bouton bouton--secondaire" onClick={onRetour}>
          ← Tous les modules
        </button>
      </div>
    </>
  );
}

function Parcours({
  onOuvrir,
  onQuiz,
}: {
  onOuvrir: (id: string) => void;
  onQuiz: () => void;
}) {
  const { faits, validations, resultatQuiz, posteChoisi, protecteurChoisi } = useTravailleur();
  const prochain = MODULES.find((m) => !faits.includes(m.id));
  const quizReussi = resultatQuiz?.reussi === true;

  const libelleCta =
    faits.length === 0
      ? `Commencer : ${MODULES[0]!.titre}`
      : prochain
        ? `Continuer : ${prochain.titre}`
        : quizReussi
          ? 'Revoir mon attestation'
          : 'Passer au quiz';

  return (
    <>
      <HeroOreille>
        <h1 style={{ marginBottom: 6 }}>Protection auditive</h1>
        <p className="carte__intro" style={{ marginBottom: 12 }}>
          Six modules de 3 à 8 minutes, à faire dans l'ordre. Chaque notion se
          manipule plutôt que de se lire.
        </p>
        <div className="hero__etat">
          <span className="hero__compteur">
            {faits.length} / {MODULES.length} modules faits
          </span>
          {quizReussi && (
            <span className="hero__compteur hero__compteur--ok">Quiz réussi ✓</span>
          )}
        </div>
        <button
          type="button"
          className="bouton hero__cta"
          onClick={() => (prochain ? onOuvrir(prochain.id) : onQuiz())}
        >
          {libelleCta}
        </button>
      </HeroOreille>

      {(!posteChoisi || !protecteurChoisi) && (
        <Carte
          titre="Dis-moi ton poste"
          intro="Les calculateurs parleront de toi : ton niveau de bruit, ta durée permise, ta protection. Modifiable à tout moment dans « Moi »."
        >
          <ChampPoste />
          <ChampProtecteur />
        </Carte>
      )}

      <div className="module-liste">
        {MODULES.map((m, i) => {
          const fait = faits.includes(m.id);
          const estProchain = prochain?.id === m.id;
          const rate = validations[m.id] === false;
          return (
            <button
              key={m.id}
              type="button"
              className={`module-carte${fait ? ' module-carte--fait' : ''}${estProchain ? ' module-carte--suivant' : ''}`}
              aria-current={estProchain ? 'step' : undefined}
              onClick={() => onOuvrir(m.id)}
            >
              <span className="module-carte__numero">{fait ? '✓' : i + 1}</span>
              <span className="module-carte__texte">
                <span className="module-carte__titre">{m.titre}</span>
                <span className="module-carte__sous">{m.sousTitre}</span>
                <span className="module-carte__meta">
                  {m.duree}
                  {estProchain && ' · à faire maintenant'}
                  {fait && !rate && ' · fait'}
                  {fait && rate && ' · fait, question ratée — à revoir'}
                </span>
              </span>
              <span className="module-carte__chevron" aria-hidden="true">
                ›
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function SectionTitre({ numero, children }: { numero: string; children: string }) {
  return (
    <h2 className="section-titre">
      <span className="section-titre__num" aria-hidden="true">
        {numero}
      </span>
      {children}
    </h2>
  );
}

function BoiteAOutils({ onProfil }: { onProfil: () => void }) {
  const { poste, protecteur, posteChoisi } = useTravailleur();
  return (
    <>
      <h1 style={{ marginBottom: 6 }}>Boîte à outils</h1>
      <p className="carte__intro">
        Les calculateurs, sans repasser par le cours — trois questions du
        terrain.
      </p>

      <div className="profil-rappel" role="status">
        <span>
          Réglé sur <strong>{poste.nom}</strong> et{' '}
          <strong>{protecteur.nom}</strong>
          {!posteChoisi && ' (poste type — choisis le tien)'}
        </span>
        <button type="button" className="profil-rappel__action" onClick={onProfil}>
          Changer
        </button>
      </div>

      <SectionTitre numero="1">Combien de temps puis-je rester exposé ?</SectionTitre>
      <DureePermise />
      <ComposeurQuart />

      <SectionTitre numero="2">Quelle protection dois-je porter ?</SectionTitre>
      <Protection />
      <BudgetRetrait />

      <SectionTitre numero="3">Qu'est-ce que je risque si je l'enlève ?</SectionTitre>
      <TempsDePort />
      <Comparateur />

      <SectionTitre numero="+">Pour aller plus loin</SectionTitre>
      <EchelleMetiers />
      <Carriere />
    </>
  );
}

function Moi({
  onOuvrir,
  onQuiz,
  presentation,
  setPresentation,
}: {
  onOuvrir: (id: string) => void;
  onQuiz: () => void;
  presentation: boolean;
  setPresentation: (v: boolean) => void;
}) {
  const { profil, majProfil, faits, validations, resultatQuiz, reinitialiserProgression } =
    useTravailleur();
  const [confirmation, setConfirmation] = useState<'progression' | 'appareil' | null>(null);
  const prochain = MODULES.find((m) => !faits.includes(m.id));

  return (
    <>
      <h1 style={{ marginBottom: 6 }}>Moi</h1>

      <Carte
        titre="Mon profil"
        intro="Réglé une fois, repris par tous les calculateurs. Rien ne quitte ton appareil."
      >
        <Champ etiquette="Mon nom — pour l'attestation">
          <input
            className="choix__select"
            autoComplete="name"
            placeholder="Prénom et nom"
            value={profil.nom}
            onChange={(e) => majProfil({ nom: e.target.value })}
          />
        </Champ>
        <ChampPoste />
        <ChampProtecteur />
      </Carte>

      <Carte titre="Ma progression">
        <div className="resultat">
          <div className="resultat__etiquette">Modules complétés</div>
          <div className="resultat__valeur">
            {faits.length} / {MODULES.length}
          </div>
          <div className="resultat__note">
            {resultatQuiz
              ? `Quiz ${resultatQuiz.reussi ? 'réussi' : 'à refaire'} le ${formaterDate(resultatQuiz.date)} — ${resultatQuiz.bonnes} / ${resultatQuiz.total}`
              : 'Quiz : pas encore fait'}
          </div>
        </div>

        <div className="barres" style={{ marginTop: 14 }}>
          {MODULES.map((m, i) => {
            const fait = faits.includes(m.id);
            const rate = validations[m.id] === false;
            return (
              <button
                key={m.id}
                type="button"
                className={`barre barre--${fait ? (rate ? 'attention' : 'ok') : 'neutre'}`}
                onClick={() => onOuvrir(m.id)}
              >
                <span>
                  {i + 1}. {m.titre}
                </span>
                <span className="barre__valeur">
                  {fait ? (rate ? '✓ à revoir' : '✓') : '—'}
                </span>
              </button>
            );
          })}
        </div>

        {prochain ? (
          <button type="button" className="bouton" onClick={() => onOuvrir(prochain.id)}>
            Continuer : {prochain.titre}
          </button>
        ) : (
          <button type="button" className="bouton" onClick={onQuiz}>
            {resultatQuiz?.reussi ? 'Voir mon attestation' : 'Passer le quiz'}
          </button>
        )}

        {confirmation === 'progression' ? (
          <div className="confirmation" role="alertdialog" aria-label="Confirmer la remise à zéro">
            <p>
              Effacer tes {faits.length} module{faits.length > 1 ? 's' : ''} fait
              {faits.length > 1 ? 's' : ''} et ton résultat de quiz ? Ton profil
              est conservé.
            </p>
            <div className="barre-boutons">
              <button
                type="button"
                className="bouton bouton--danger"
                onClick={() => {
                  reinitialiserProgression();
                  setConfirmation(null);
                }}
              >
                Oui, tout effacer
              </button>
              <button
                type="button"
                className="bouton bouton--secondaire"
                onClick={() => setConfirmation(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          (faits.length > 0 || resultatQuiz) && (
            <button
              type="button"
              className="bouton bouton--secondaire"
              onClick={() => setConfirmation('progression')}
            >
              Recommencer la formation
            </button>
          )
        )}
      </Carte>

      <Carte titre="Télécharger l'application">
        <p className="carte__intro">
          Installe le site comme une vraie app <strong>avant de descendre</strong> :
          une fois installé, il fonctionne <strong>sans réseau</strong> — au
          fond, comme en surface.
        </p>
        <CarteInstall />
        <Avertissement>
          Rien ne quitte ton appareil : pas de compte, pas de serveur, aucune
          donnée transmise. Ta progression est stockée localement.
        </Avertissement>
      </Carte>

      <details className="formateur">
        <summary>Réglages du formateur</summary>
        <p className="carte__intro">
          Pour la salle et les appareils de prêt. Un travailleur n'a pas besoin
          d'y toucher.
        </p>

        <Champ etiquette="Affichage">
          <Choix
            options={[
              { id: 'normal', nom: 'Écran normal' },
              { id: 'projeter', nom: 'Projeter en salle' },
            ]}
            valeur={presentation ? 'projeter' : 'normal'}
            onChange={(id) => setPresentation(id === 'projeter')}
          />
          <p className="champ__aide">
            En projection : gros caractères, et les flèches ← → du clavier
            passent d'un module à l'autre (Échap : la liste).
          </p>
        </Champ>

        <FacteurDerating />

        {confirmation === 'appareil' ? (
          <div className="confirmation" role="alertdialog" aria-label="Confirmer la réinitialisation">
            <p>
              Effacer <strong>tout</strong> ce que cet appareil a mémorisé
              (profil, progression, quiz, réglages) ? À faire avant de le
              prêter à un autre travailleur.
            </p>
            <div className="barre-boutons">
              <button type="button" className="bouton bouton--danger" onClick={effacerTout}>
                Oui, réinitialiser
              </button>
              <button
                type="button"
                className="bouton bouton--secondaire"
                onClick={() => setConfirmation(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="bouton bouton--secondaire"
            onClick={() => setConfirmation('appareil')}
          >
            Réinitialiser cet appareil
          </button>
        )}

        <p className="carte__source carte__source--credit" style={{ marginTop: 14 }}>
          Version {__VERSION__} · se met à jour automatiquement
        </p>
      </details>
    </>
  );
}
