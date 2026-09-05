import { useEffect, useRef, useState } from 'react';
import { MODULES } from './parcours/modules.js';
import { Quiz } from './quiz/Quiz.js';
import { reinitialiserFormation, useProgression, useStockage } from './etat/stockage.js';
import { FournisseurConfig } from './etat/config.js';
import { Avertissement, Carte } from './ui/composants.js';
import { BudgetRetrait } from './outils/BudgetRetrait.js';
import { ComposeurQuart } from './outils/ComposeurQuart.js';
import { Comparateur } from './outils/Comparateur.js';
import { DureePermise, EchelleMetiers } from './outils/DureePermise.js';
import { Protection } from './outils/Protection.js';
import { TempsDePort } from './outils/TempsDePort.js';
import { SommationSources } from './outils/SommationSources.js';
import { Carriere } from './outils/Carriere.js';
import { PoseBouchons, VerifCoquilles } from './outils/Pose.js';
import { BanniereInstall, BanniereMiseAJour, CarteInstall } from './ui/InstallerApp.js';
import { OUTILS, GROUPES, filtrerOutils } from './outils/catalogue.js';
import { hashRoute, lireRoute, prochainModule, type Route, type Zone } from './navigation.js';

const IDS_MODULES = MODULES.map(m => m.id);
const IDS_OUTILS = OUTILS.map(o => o.id);
const ZONES: readonly { id: Zone; nom: string; icone: string }[] = [
  { id: 'parcours', nom: 'Formation', icone: '01' },
  { id: 'outils', nom: 'Outils', icone: '02' },
  { id: 'quiz', nom: 'Quiz', icone: '03' },
  { id: 'moi', nom: 'Mon suivi', icone: '04' },
];
const FICHES = {
  quart: ComposeurQuart, duree: DureePermise, metiers: EchelleMetiers,
  protection: Protection, port: TempsDePort, retrait: BudgetRetrait,
  comparateur: Comparateur, sources: SommationSources, carriere: Carriere,
  pose: () => <><PoseBouchons /><VerifCoquilles /></>,
};

export default function App() {
  const [route, setRoute] = useState(() => lireRoute(location.hash, IDS_MODULES, IDS_OUTILS));
  const [presentation, setPresentation] = useStockage('presentation', false);
  const [dernierModule, setDernierModule] = useStockage('dernier-module', '');
  const [outilsVisites, setOutilsVisites] = useState<string[]>(route.outil ? [route.outil] : []);
  const progression = useProgression();
  const faits = progression.faits.filter(id => IDS_MODULES.includes(id));
  const routePrecedente = useRef(hashRoute(route));
  const module = MODULES.find(m => m.id === route.module);
  const indexModule = MODULES.findIndex(m => m.id === route.module);
  const outil = OUTILS.find(o => o.id === route.outil);
  function naviguer(destination: Route) {
    const hash = hashRoute(destination);
    if (location.hash !== hash) location.hash = hash;
    else setRoute({ ...destination });
  }
  function ouvrirModule(id: string) { setDernierModule(id); naviguer({ zone: 'parcours', module: id }); }
  useEffect(() => {
    const changer = () => setRoute(lireRoute(location.hash, IDS_MODULES, IDS_OUTILS));
    window.addEventListener('hashchange', changer);
    return () => window.removeEventListener('hashchange', changer);
  }, []);
  useEffect(() => {
    if (route.outil) setOutilsVisites(anciens => [...new Set([...anciens, route.outil!])]);
    if (route.module) setDernierModule(route.module);
    document.title = `${module?.titre ?? outil?.titre ?? ZONES.find(z => z.id === route.zone)?.nom} · Bruit`;
    const routeActuelle = hashRoute(route);
    if (routePrecedente.current === routeActuelle) return;
    routePrecedente.current = routeActuelle;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      const titres = Array.from(document.querySelectorAll<HTMLElement>('#contenu [data-page-title], #contenu h1'));
      const cible = titres.find(titre => !titre.closest('[hidden]')) ?? document.getElementById('contenu');
      if (cible) { cible.tabIndex = -1; cible.focus({ preventScroll: true }); }
    });
    return () => cancelAnimationFrame(frame);
  }, [route, module, outil, setDernierModule]);
  const prochaine = prochainModule(IDS_MODULES, faits, dernierModule);
  return <FournisseurConfig><div className={`app${presentation ? ' app--presentation' : ''}`}>
    <a className="lien-evitement" href="#contenu" onClick={e => { e.preventDefault(); document.getElementById('contenu')?.focus(); document.getElementById('contenu')?.scrollIntoView({ block: 'start' }); }}>Aller au contenu</a>
    <aside className="sidebar">
      <button className="sidebar__marque" onClick={() => naviguer({ zone: 'parcours' })} aria-label="Bruit, accueil de la formation">
        <span className="sidebar__logo"><span className="sidebar__barre" aria-hidden="true" />Machines Roger</span><span className="sidebar__sous">BRUIT · Protection auditive</span>
      </button>
      <nav className="sidebar__nav" aria-label="Navigation principale">{ZONES.map(z => <button key={z.id} type="button" className={`sidebar__item${route.zone === z.id ? ' sidebar__item--actif' : ''}`} aria-current={route.zone === z.id ? 'page' : undefined} onClick={() => naviguer({ zone: z.id })}><span className="sidebar__num" aria-hidden="true">{z.icone}</span>{z.nom}</button>)}</nav>
      <div className="progression-piste"><span>{faits.length} / {MODULES.length} modules terminés</span><progress value={faits.length} max={MODULES.length} aria-label="Modules terminés" /></div>
      <p className="sidebar__pied">Formation SST · Machines Roger International<br />Version {__VERSION__}</p>
    </aside>
    <div className="stage">
      <header className="entete"><span className="entete__marque" aria-hidden="true" /><span className="entete__titre">{module?.titre ?? outil?.titre ?? 'Bruit · Protection auditive'}</span>
        <button type="button" className="entete__action" aria-pressed={presentation} onClick={() => setPresentation(!presentation)} title="Agrandir le contenu pour la projection en salle">{presentation ? 'Quitter la projection' : 'Projeter'}</button></header>
      <main className="contenu" id="contenu" tabIndex={-1}>
        <BanniereMiseAJour /><BanniereInstall />
        {route.zone === 'parcours' && (module ? <div className="lecture">
          <button className="bouton bouton--secondaire bouton--retour" onClick={() => naviguer({ zone: 'parcours' })}>← Tous les modules</button>
          <header className="lecture-entete"><p className="sur-titre">Module {indexModule + 1} / {MODULES.length} · {faits.includes(module.id) ? 'Terminé' : 'À parcourir'}</p><h1 data-page-title tabIndex={-1}>{module.titre}</h1><p>{module.sousTitre}</p></header>
          <nav className="lecture-etapes" aria-label="Modules de formation">{MODULES.map((m, i) => <button key={m.id} onClick={() => ouvrirModule(m.id)} aria-current={m.id === module.id ? 'step' : undefined} aria-label={`Module ${i + 1} : ${m.titre}${faits.includes(m.id) ? ', terminé' : ''}`}>{i + 1}{faits.includes(m.id) ? ' ✓' : ''}</button>)}</nav>
          <div key={module.id}>{module.contenu()}</div>
          <div className="lecture-actions">{indexModule > 0 && <button className="bouton bouton--secondaire" onClick={() => ouvrirModule(MODULES[indexModule - 1]!.id)}>← Module précédent</button>}
            <button className="bouton" onClick={() => { progression.marquerFait(module.id); const suivant = MODULES[indexModule + 1]; if (suivant) ouvrirModule(suivant.id); else naviguer({ zone: 'quiz' }); }}>{indexModule + 1 < MODULES.length ? 'Terminer et continuer →' : 'Terminer et passer au quiz →'}</button></div>
          <p className="carte__intro">« Terminer » marque ce module comme parcouru. Le quiz évalue les connaissances.</p>
        </div> : <Parcours faits={faits} prochaine={prochaine} dernierModule={dernierModule} onOuvrir={ouvrirModule} naviguer={naviguer} />)}
        {/* Les outils ouverts conservent leurs réglages pendant cette visite. */}
        <div hidden={route.zone !== 'outils'}>
          {route.zone === 'outils' && !outil && <Catalogue onChoisir={id => naviguer({ zone: 'outils', outil: id })} />}
          {outilsVisites.map(id => { const info = OUTILS.find(o => o.id === id)!; const Fiche = FICHES[info.id]; return <div className="outil-ouvert" key={id} hidden={route.outil !== id}>
            <button className="bouton bouton--secondaire bouton--retour" onClick={() => naviguer({ zone: 'outils' })}>← Tous les outils</button>
            <header className="outil-entete"><p className="sur-titre">{info.groupe} · Outil pédagogique</p><h1 data-page-title tabIndex={-1}>{info.titre}</h1><p>{info.description}</p></header>
            <Fiche /><p className="carte__intro">Les réglages restent disponibles pendant cette visite. Ils ne constituent pas une mesure de terrain.</p></div>; })}
        </div>
        {route.zone === 'quiz' && <div className="lecture"><Quiz /></div>}
        {route.zone === 'moi' && <div className="lecture"><Moi faits={faits} prochaine={prochaine} onOuvrir={ouvrirModule} naviguer={naviguer} /></div>}
        <p className="pied">Estimations pédagogiques calculées à partir des dosimétries de la mine. Ne remplace ni une dosimétrie individuelle, ni l'évaluation d'un hygiéniste du travail, ni le programme de conservation de l'ouïe de l'employeur.</p>
      </main>
    </div>
    <nav className="nav" aria-label="Navigation mobile">{ZONES.map(z => <button key={z.id} type="button" className={`nav__item${route.zone === z.id ? ' nav__item--actif' : ''}`} aria-current={route.zone === z.id ? 'page' : undefined} onClick={() => naviguer({ zone: z.id })}><span className="nav__icone" aria-hidden="true">{z.icone}</span>{z.nom}</button>)}</nav>
  </div></FournisseurConfig>;
}

function Parcours({ faits, prochaine, dernierModule, onOuvrir, naviguer }: { faits: readonly string[]; prochaine?: string; dernierModule: string; onOuvrir: (id: string) => void; naviguer: (route: Route) => void }) {
  return <>
    <section className="accueil-hero"><div className="accueil-hero__texte">
      <p className="sur-titre">Formation SST · Milieu minier</p><h1 data-page-title tabIndex={-1}>Le bon réflexe<br /><span>face au bruit.</span></h1>
      <p>Comprendre les risques. Choisir sa protection. Garder les bons gestes, tout au long du quart.</p>
      <div className="accueil-reperes"><span>6 modules</span><span>Environ 15 minutes</span><span>Quiz de validation</span></div>
      <div className="accueil-actions"><button className="bouton" onClick={() => prochaine && onOuvrir(prochaine)}>{faits.length === MODULES.length ? 'Revoir la formation' : dernierModule || faits.length ? 'Continuer la formation' : 'Commencer la formation'} →</button><button className="bouton bouton--secondaire" onClick={() => naviguer({ zone: 'outils', outil: 'quart' })}>Estimer mon quart ↗</button></div>
    </div><div className="accueil-hero__visuel">
      <svg viewBox="0 0 320 170" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M50 67v36m24-58v80m24-98v116m24-142v168m24-122v76m24-95v114m24-85v56m24-88v120m24-139v158m24-108v58" /></g></svg>
      <p className="sur-titre">Comprendre pour agir</p><strong>Votre ouïe mérite<br />votre attention.</strong><button onClick={() => onOuvrir('dommages')}>Explorer l’oreille et les effets du bruit →</button>
    </div></section>
    <div className="progression-piste"><span><strong>{faits.length} / {MODULES.length}</strong> modules terminés</span><progress value={faits.length} max={MODULES.length} aria-label="Progression dans les modules" /><button onClick={() => naviguer({ zone: 'moi' })}>Voir mon suivi →</button></div>
    <div className="section-titre"><div><p className="sur-titre">Le parcours</p><h2>Une étape à la fois</h2></div><p>Choisissez un module. Revenez quand vous voulez.</p></div>
    <div className="module-liste">{MODULES.map((m, i) => <button key={m.id} className={`module-carte${faits.includes(m.id) ? ' module-carte--fait' : ''}`} onClick={() => onOuvrir(m.id)}><span className="module-carte__numero">{faits.includes(m.id) ? '✓' : String(i + 1).padStart(2, '0')}</span><span className="module-carte__texte"><span className="module-carte__titre">{m.titre}</span><span className="module-carte__sous">{m.sousTitre}</span><small>{faits.includes(m.id) ? 'Terminé · Revoir' : 'À parcourir'} · {m.diapos}</small></span><span className="module-carte__chevron" aria-hidden="true">↗</span></button>)}</div>
  </>;
}

function Catalogue({ onChoisir }: { onChoisir: (id: string) => void }) {
  const [recherche, setRecherche] = useState('');
  const [groupe, setGroupe] = useState<string>('Tous');
  const outils = filtrerOutils(recherche, groupe);
  return <section className="outils-catalogue"><p className="sur-titre">La boîte à outils</p><h1 data-page-title tabIndex={-1}>De quoi avez-vous besoin ?</h1><p className="carte__intro">Un outil à la fois. Les mêmes calculs que dans la formation.</p>
    <label className="outil-recherche">Trouver un outil<input type="search" value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Quart, bouchons, durée…" /></label>
    <div className="outils-filtres" role="group" aria-label="Catégories d'outils">{GROUPES.map(g => <button key={g} aria-pressed={g === groupe} onClick={() => setGroupe(g)}>{g}</button>)}</div>
    <p role="status" className="carte__intro">{outils.length} outil{outils.length > 1 ? 's' : ''} disponible{outils.length > 1 ? 's' : ''}</p>
    {outils.length ? <div className="outils-cartes">{outils.map(o => <button key={o.id} className="outil-carte" onClick={() => onChoisir(o.id)}><small>{o.groupe}</small><strong>{o.titre} ↗</strong><span>{o.description}</span></button>)}</div> : <Carte><p>Aucun outil ne correspond. Essayez un autre mot.</p><button className="bouton bouton--secondaire" onClick={() => { setRecherche(''); setGroupe('Tous'); }}>Afficher tous les outils</button></Carte>}
  </section>;
}

function Moi({ faits, prochaine, onOuvrir, naviguer }: { faits: readonly string[]; prochaine?: string; onOuvrir: (id: string) => void; naviguer: (route: Route) => void }) {
  const [nom] = useStockage('nom', '');
  const [messageReset, setMessageReset] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const boutonReset = useRef<HTMLButtonElement>(null);
  function fermer() { dialog.current?.close(); boutonReset.current?.focus(); }
  return <>
    <header className="lecture-entete"><p className="sur-titre">Sur cet appareil</p><h1 data-page-title tabIndex={-1}>Mon suivi</h1><p>Reprendre, vérifier et conserver son résultat.</p></header>
    <Carte><div className="resultat"><div className="resultat__etiquette">Modules terminés</div><div className="resultat__valeur">{faits.length} / {MODULES.length}</div>{nom && <div className="resultat__note">{nom}</div>}</div>
      <div className="suivi-actions"><button className="bouton" onClick={() => prochaine && onOuvrir(prochaine)}>Reprendre la formation →</button><button className="bouton bouton--secondaire" onClick={() => naviguer({ zone: 'quiz' })}>Ouvrir mon quiz et mon résultat</button></div>
      <div className="barres">{MODULES.map(m => <button key={m.id} className={`barre barre--${faits.includes(m.id) ? 'ok' : 'attention'}`} onClick={() => onOuvrir(m.id)}><span>{m.titre}</span><span className="barre__valeur">{faits.includes(m.id) ? '✓ Terminé' : 'À parcourir'}</span></button>)}</div>
      <Avertissement>Les modules sont marqués comme parcourus. La réussite est évaluée séparément dans le quiz.</Avertissement></Carte>
    <Carte titre="Sur téléphone, même sans réseau"><CarteInstall /><p className="carte__intro">Les leçons, calculs et médias locaux sont accessibles après leur téléchargement complet. Le modèle externe Sketchfab demande une connexion.</p><Avertissement>Votre nom, progression et résultat restent dans ce navigateur. Les contenus externes se chargent seulement à votre demande.</Avertissement><p className="carte__source">Version {__VERSION__}</p></Carte>
    <Carte titre="Recommencer sur cet appareil"><p className="carte__intro">Efface le nom, la progression et les réponses du quiz. Les réglages de calcul restent inchangés.</p><button ref={boutonReset} className="bouton bouton--secondaire" onClick={() => dialog.current?.showModal()}>Réinitialiser ma formation</button>{messageReset && <p role="status">{messageReset}</p>}</Carte>
    <dialog ref={dialog} className="dialog-confirmation" aria-labelledby="titre-reset" onCancel={e => { e.preventDefault(); fermer(); }}><h2 id="titre-reset">Recommencer la formation ?</h2><p>Le nom, les modules terminés et le résultat du quiz seront effacés sur cet appareil.</p><div className="dialog-actions"><button className="bouton bouton--secondaire" autoFocus onClick={fermer}>Conserver ma progression</button><button className="bouton" onClick={() => { const efface = reinitialiserFormation(); setMessageReset(efface ? 'Formation réinitialisée. Vos réglages de calcul sont conservés.' : 'Formation réinitialisée pour cette visite. Le navigateur a refusé l’effacement du stockage permanent.'); fermer(); }}>Effacer et recommencer</button></div></dialog>
  </>;
}
