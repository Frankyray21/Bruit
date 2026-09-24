/**
 * Bouton « Télécharger l'application ».
 *
 * Le site est une PWA : on peut l'installer comme une vraie app, et elle
 * fonctionne ensuite hors-ligne (au fond, comme en surface). L'installation
 * n'est pas la même selon l'appareil :
 *   • Android / ordinateur (Chrome, Edge) : une vraie invite système, déclenchée
 *     par le bouton via l'évènement `beforeinstallprompt`.
 *   • iPhone / iPad (Safari) : pas d'invite possible — on montre le geste
 *     (Partager → « Sur l'écran d'accueil »).
 *   • Déjà installée : on confirme, et on n'affiche plus rien d'incitatif.
 *
 * Deux présentations : une bannière discrète en haut du site, et une carte
 * détaillée dans l'onglet « Moi ».
 */

import { useEffect, useState } from 'react';

/** L'évènement d'installation, absent des types standards du DOM. */
interface EvtInstall extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const CLE_MASQUE = 'installer-masque';

function estInstallee(): boolean {
  return (
    matchMedia('(display-mode: standalone)').matches ||
    // Safari iOS : propriété non standard.
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function estIOS(): boolean {
  const ua = navigator.userAgent;
  const iOS = /iphone|ipad|ipod/i.test(ua);
  // iPad récent se présente en « Macintosh » mais a un écran tactile.
  const iPadOS = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return iOS || iPadOS;
}

interface EtatInstall {
  evt: EvtInstall | null;
  installee: boolean;
  ios: boolean;
}

function useInstall(): EtatInstall & {
  installer: () => void;
} {
  const [evt, setEvt] = useState<EvtInstall | null>(null);
  const [installee, setInstallee] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setInstallee(estInstallee());
    setIos(estIOS());

    const surPrompt = (e: Event) => {
      e.preventDefault(); // on garde la main : c'est notre bouton qui déclenche
      setEvt(e as EvtInstall);
    };
    const surInstall = () => {
      setInstallee(true);
      setEvt(null);
    };

    window.addEventListener('beforeinstallprompt', surPrompt);
    window.addEventListener('appinstalled', surInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', surPrompt);
      window.removeEventListener('appinstalled', surInstall);
    };
  }, []);

  const installer = () => {
    if (!evt) return;
    void evt.prompt();
    void evt.userChoice.finally(() => setEvt(null));
  };

  return { evt, installee, ios, installer };
}

/** L'icône Partager de Safari (carré, flèche vers le haut), dessinée en code. */
function IconePartager() {
  return (
    <svg
      className="icone-partager"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15V3" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

/** Le geste iOS, pas à pas. */
function InstructionsIOS() {
  return (
    <p className="carte__intro" style={{ marginBottom: 0 }}>
      Sur iPhone : touche le bouton <strong>Partager</strong>{' '}
      <IconePartager /> (le carré avec une flèche vers le haut, en bas de
      Safari), puis <strong>« Sur l'écran d'accueil »</strong>. L'app s'ajoute
      comme les autres.
    </p>
  );
}

type EtatHorsLigne = 'inconnu' | 'en-cours' | 'pret';

/**
 * Le contenu est-il téléchargé pour fonctionner sans réseau ?
 *
 * `navigator.serviceWorker.ready` se résout quand le service worker est actif,
 * c'est-à-dire une fois tous les fichiers du site mis en cache. C'est le
 * signal « tu peux descendre ».
 */
function useHorsLigne(): EtatHorsLigne {
  const [etat, setEtat] = useState<EtatHorsLigne>('inconnu');
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let annule = false;
    setEtat('en-cours');
    navigator.serviceWorker.ready
      .then(() => {
        if (!annule) setEtat('pret');
      })
      .catch(() => {
        if (!annule) setEtat('inconnu');
      });
    // Sans service worker (mode développement, stockage bloqué), `ready` ne
    // se résout jamais : on cesse d'annoncer un téléchargement au bout de 30 s.
    const limite = setTimeout(() => {
      if (!annule) setEtat((e) => (e === 'en-cours' ? 'inconnu' : e));
    }, 30_000);
    return () => {
      annule = true;
      clearTimeout(limite);
    };
  }, []);
  return etat;
}

function EtatContenu() {
  const etat = useHorsLigne();
  if (etat === 'pret') {
    return (
      <div className="verdict verdict--vert" role="status" style={{ marginTop: 0, marginBottom: 12 }}>
        <span className="verdict__pastille" aria-hidden="true">
          ✓
        </span>
        <span>Contenu téléchargé : le site fonctionne sans réseau sur cet appareil.</span>
      </div>
    );
  }
  if (etat === 'en-cours') {
    return (
      <div className="verdict verdict--jaune" role="status" style={{ marginTop: 0, marginBottom: 12 }}>
        <span className="verdict__pastille" aria-hidden="true">
          ⏳
        </span>
        <span>Téléchargement du contenu en cours — garde la page ouverte quelques secondes.</span>
      </div>
    );
  }
  return null;
}

/** Bannière discrète en haut du site — se cache une fois masquée ou installée. */
export function BanniereInstall({ onAide }: { onAide: () => void }) {
  const { evt, installee, ios, installer } = useInstall();
  const [masque, setMasque] = useState(
    () => localStorage.getItem(CLE_MASQUE) === '1',
  );

  if (installee || masque) return null;
  if (!evt && !ios) return null; // rien à proposer sur ce navigateur

  const fermer = () => {
    localStorage.setItem(CLE_MASQUE, '1');
    setMasque(true);
  };

  return (
    <div className="installer-banniere" role="region" aria-label="Installer l'application">
      <span className="installer-banniere__icone" aria-hidden="true">
        ⤓
      </span>
      <span className="installer-banniere__texte">
        Installe l'app pour l'utiliser <strong>hors-ligne</strong>, au fond.
      </span>
      {evt ? (
        <button
          type="button"
          className="installer-banniere__action"
          onClick={installer}
        >
          Installer
        </button>
      ) : (
        <button type="button" className="installer-banniere__action" onClick={onAide}>
          Comment ?
        </button>
      )}
      <button
        type="button"
        className="installer-banniere__fermer"
        onClick={fermer}
        aria-label="Masquer"
      >
        ×
      </button>
    </div>
  );
}

/** Carte détaillée pour l'onglet « Moi ». */
export function CarteInstall() {
  const { evt, installee, ios, installer } = useInstall();

  if (installee) {
    return (
      <>
        <EtatContenu />
        <div className="verdict verdict--vert" role="status">
          <span className="verdict__pastille" aria-hidden="true">
            ✓
          </span>
          <span>
            Application installée — elle fonctionne hors-ligne, sans réseau.
          </span>
        </div>
      </>
    );
  }

  if (evt) {
    return (
      <>
        <EtatContenu />
        <button type="button" className="bouton" onClick={installer}>
          ⤓ Télécharger l'application
        </button>
        <p
          className="carte__intro"
          style={{ marginTop: 10, marginBottom: 0, fontSize: '0.82rem' }}
        >
          S'installe comme une vraie app et fonctionne ensuite hors-ligne.
        </p>
      </>
    );
  }

  if (ios) {
    return (
      <>
        <EtatContenu />
        <InstructionsIOS />
      </>
    );
  }

  // Navigateur sans invite (Firefox, ou l'évènement pas encore prêt).
  return (
    <>
      <EtatContenu />
      <p className="carte__intro" style={{ marginBottom: 0 }}>
        Depuis le menu de ton navigateur (⋮), choisis{' '}
        <strong>« Ajouter à l'écran d'accueil »</strong> ou{' '}
        <strong>« Installer l'application »</strong>. Elle fonctionnera ensuite
        hors-ligne.
      </p>
    </>
  );
}
