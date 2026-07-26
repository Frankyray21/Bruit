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

/** Le geste iOS, décrit avec le glyphe du bouton Partager de Safari. */
function InstructionsIOS() {
  return (
    <p className="carte__intro" style={{ marginBottom: 0 }}>
      Sur iPhone : touche{' '}
      <span aria-label="le bouton Partager" role="img">
        􀈂
      </span>{' '}
      <strong>Partager</strong> en bas de Safari, puis{' '}
      <strong>« Sur l'écran d'accueil »</strong>. L'app s'ajoute comme les
      autres.
    </p>
  );
}

/** Bannière discrète en haut du site — se cache une fois masquée ou installée. */
export function BanniereInstall() {
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
        <span className="installer-banniere__ios" aria-hidden="true">
          Partager → écran d'accueil
        </span>
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
      <div className="verdict verdict--vert" role="status">
        <span className="verdict__pastille" aria-hidden="true">
          ✓
        </span>
        <span>
          Application installée — elle fonctionne hors-ligne, sans réseau.
        </span>
      </div>
    );
  }

  if (evt) {
    return (
      <>
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

  if (ios) return <InstructionsIOS />;

  // Navigateur sans invite (Firefox, ou l'évènement pas encore prêt).
  return (
    <p className="carte__intro" style={{ marginBottom: 0 }}>
      Depuis le menu de ton navigateur (⋮), choisis{' '}
      <strong>« Ajouter à l'écran d'accueil »</strong> ou{' '}
      <strong>« Installer l'application »</strong>. Elle fonctionnera ensuite
      hors-ligne.
    </p>
  );
}
