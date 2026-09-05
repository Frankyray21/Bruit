/// <reference types="vite-plugin-pwa/react" />
/** Installation partagée et mises à jour demandées par le travailleur. */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useStockage } from '../etat/stockage.js';

interface EvtInstall extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
interface EtatInstall {
  evt: EvtInstall | null;
  installee: boolean;
  ios: boolean;
  enCours: boolean;
  erreur: string;
}
let etatInstall: EtatInstall = { evt: null, installee: false, ios: false, enCours: false, erreur: '' };
const abonnes = new Set<() => void>();
let ecouteInstallee = false;
function publier(changement: Partial<EtatInstall>) {
  etatInstall = { ...etatInstall, ...changement };
  abonnes.forEach((abonne) => abonne());
}
function initialiserInstallation() {
  if (ecouteInstallee || typeof window === 'undefined') return;
  ecouteInstallee = true;
  const ua = navigator.userAgent;
  publier({
    installee: window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true,
    ios: /iphone|ipad|ipod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1),
  });
  window.addEventListener('beforeinstallprompt', (evt) => {
    evt.preventDefault();
    publier({ evt: evt as EvtInstall, erreur: '' });
  });
  window.addEventListener('appinstalled', () => publier({ installee: true, evt: null, enCours: false }));
}
function abonnerInstallation(callback: () => void) {
  abonnes.add(callback);
  initialiserInstallation();
  return () => { abonnes.delete(callback); };
}
async function installer() {
  if (!etatInstall.evt || etatInstall.enCours) return;
  const evt = etatInstall.evt;
  publier({ enCours: true, erreur: '' });
  try {
    await evt.prompt();
    await evt.userChoice;
    publier({ evt: null, enCours: false });
  } catch {
    publier({ evt: null, enCours: false, erreur: "Utilise le menu du navigateur pour installer l'application." });
  }
}
function useInstall() {
  return useSyncExternalStore(abonnerInstallation, () => etatInstall, () => etatInstall);
}
function InstructionsIOS() {
  return <p className="carte__intro">Sur iPhone ou iPad : touche <strong>Partager</strong>, puis <strong>Sur l'écran d'accueil</strong>.</p>;
}
export function BanniereInstall() {
  const { evt, installee, ios, enCours, erreur } = useInstall();
  const [masque, setMasque] = useStockage('installer-masque', false);
  if (installee || masque || (!evt && !ios && !erreur)) return null;
  return <div className="installer-banniere" role="region" aria-label="Installer l'application">
    <span className="installer-banniere__icone" aria-hidden="true">⤓</span>
    <span className="installer-banniere__texte">Garde la formation à portée de main. Prépare le hors-ligne avant de descendre.</span>
    {evt ? <button type="button" className="installer-banniere__action" disabled={enCours} onClick={() => void installer()}>{enCours ? 'Installation…' : 'Installer'}</button> : ios ? <span>Partager → écran d'accueil</span> : null}
    {erreur && <span role="status">{erreur}</span>}
    <button type="button" className="installer-banniere__fermer" onClick={() => setMasque(true)} aria-label="Masquer le conseil d'installation">×</button>
  </div>;
}
export function CarteInstall() {
  const { evt, installee, ios, enCours, erreur } = useInstall();
  return <>
    {installee ? <p role="status">✓ Application installée.</p> : evt ?
      <button type="button" className="bouton" disabled={enCours} onClick={() => void installer()}>{enCours ? 'Installation…' : "Installer l'application"}</button>
      : ios ? <InstructionsIOS /> : <p className="carte__intro">Dans le menu du navigateur, choisis <strong>Installer l'application</strong> ou <strong>Ajouter à l'écran d'accueil</strong>.</p>}
    {erreur && <p role="status">{erreur}</p>}
    <p className="carte__intro">Ouvre le site avec du réseau avant de descendre. Les ressources externes nécessitent Internet ; les médias locaux sont préparés pour le hors-ligne.</p>
  </>;
}
export function BanniereMiseAJour() {
  const [enLigne, setEnLigne] = useState(() => navigator.onLine);
  const [dejaPrepare, setDejaPrepare] = useState(false);
  const [erreur, setErreur] = useState('');
  const [actualisation, setActualisation] = useState(false);
  const [controleChange, setControleChange] = useState(false);
  const actualisationDemandee = useRef(false);
  const { needRefresh: [miseAJour], offlineReady: [pret], updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisterError: () => setErreur('Préparation hors ligne indisponible. Réessaie avec du réseau.'),
    onNeedReload: () => {
      // Une actualisation dans un autre onglet ne doit pas interrompre celui-ci.
      if (actualisationDemandee.current) window.location.reload();
      else setControleChange(true);
    },
  });
  useEffect(() => {
    // offlineReady signale la première installation seulement. Après reload,
    // reconnaître aussi le worker actif de cette app, jamais celui d'un voisin.
    let vivant = true;
    if ('serviceWorker' in navigator) {
      const portee = new URL(import.meta.env.BASE_URL, location.origin).href;
      void navigator.serviceWorker.ready.then(registration => {
        if (vivant && registration.active && registration.scope === portee) setDejaPrepare(true);
      }).catch(() => {});
    }
    const actualiser = () => setEnLigne(navigator.onLine);
    window.addEventListener('online', actualiser);
    window.addEventListener('offline', actualiser);
    return () => {
      vivant = false;
      window.removeEventListener('online', actualiser);
      window.removeEventListener('offline', actualiser);
    };
  }, []);
  async function appliquer() {
    if (!window.confirm('Actualiser le site ? Le quiz est sauvegardé. Les réglages temporaires des outils seront réinitialisés.')) return;
    setActualisation(true);
    actualisationDemandee.current = true;
    if (controleChange) { window.location.reload(); return; }
    try { await updateServiceWorker(true); }
    catch { actualisationDemandee.current = false; setActualisation(false); setErreur('Actualisation impossible. Réessaie avec du réseau.'); }
  }
  return <div className="etat-reseau">
    <p role="status">{!enLigne ? 'Hors ligne. Les contenus téléchargés restent accessibles.' : pret || dejaPrepare ? 'Contenus principaux prêts hors ligne.' : 'En ligne. Prépare le site avant de descendre.'}</p>
    {(miseAJour || controleChange) && <div className="mise-a-jour" role="status">
      <span>Une nouvelle version est prête. Actualise quand tu as terminé tes calculs.</span>
      <button type="button" className="bouton bouton--secondaire" disabled={actualisation} onClick={() => void appliquer()}>{actualisation ? 'Actualisation…' : 'Actualiser'}</button>
    </div>}
    {erreur && <p role="status">{erreur}</p>}
  </div>;
}
