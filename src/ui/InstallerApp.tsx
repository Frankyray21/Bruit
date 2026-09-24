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
import { estNavigateurIntegre, URL_SITE } from './navigateur.js';

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
  /** Navigateur intégré (Messenger, Teams, SMS…) : l'installation y est impossible. */
  integre: boolean;
}

function useInstall(): EtatInstall & {
  installer: () => void;
} {
  const [evt, setEvt] = useState<EvtInstall | null>(null);
  const [installee, setInstallee] = useState(false);
  const [ios, setIos] = useState(false);
  const [integre, setIntegre] = useState(false);

  useEffect(() => {
    setInstallee(estInstallee());
    setIos(estIOS());
    setIntegre(estNavigateurIntegre(navigator.userAgent));

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

  return { evt, installee, ios, integre, installer };
}

/** Copie l'adresse du site ; renvoie true si la copie a réussi. */
async function copierLien(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(URL_SITE);
    return true;
  } catch {
    return false;
  }
}

/** « Copier le lien », avec confirmation en place. */
export function BoutonCopierLien({ secondaire = false }: { secondaire?: boolean }) {
  const [etat, setEtat] = useState<'repos' | 'copie' | 'echec'>('repos');
  return (
    <>
      <button
        type="button"
        className={`bouton${secondaire ? ' bouton--secondaire' : ''}`}
        aria-live="polite"
        onClick={async () => {
          setEtat((await copierLien()) ? 'copie' : 'echec');
          setTimeout(() => setEtat('repos'), 4000);
        }}
      >
        {etat === 'copie' ? 'Lien copié ✓' : 'Copier le lien'}
      </button>
      {etat === 'echec' && (
        <p className="champ__aide" role="status">
          La copie n'a pas fonctionné : l'adresse est <strong>{URL_SITE}</strong>
        </p>
      )}
    </>
  );
}

/** « Partager le lien » (feuille de partage du téléphone), sinon copie. */
export function BoutonPartagerLien() {
  const [copie, setCopie] = useState(false);
  const partager = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bruit — Protection auditive',
          text: "L'app de formation sur la protection auditive (fonctionne sans réseau une fois installée).",
          url: URL_SITE,
        });
        return;
      } catch (e) {
        // Feuille fermée par la personne : rien à faire. Tout autre échec
        // (partage non branché dans un navigateur intégré…) : on copie.
        if ((e as DOMException).name === 'AbortError') return;
      }
    }
    setCopie(await copierLien());
    setTimeout(() => setCopie(false), 4000);
  };
  return (
    <button type="button" className="bouton bouton--secondaire" onClick={partager}>
      {copie ? 'Lien copié ✓' : 'Partager le lien à un collègue'}
    </button>
  );
}

/**
 * Le code QR de l'adresse du site (public/qr.svg, généré par `npm run qr`).
 * En salle, projeté en grand : chacun scanne et installe.
 */
export function CodeQr({ grand = false }: { grand?: boolean }) {
  return (
    <figure className={`qr${grand ? ' qr--grand' : ''}`}>
      <img
        src={`${import.meta.env.BASE_URL}qr.svg`}
        alt={`Code QR vers ${URL_SITE}`}
        width={grand ? 220 : 120}
        height={grand ? 220 : 120}
      />
      <figcaption>
        <strong>Scanne pour installer l'app</strong>
        <span>{URL_SITE.replace(/^https:\/\//, '')}</span>
      </figcaption>
    </figure>
  );
}

/** Le message pour un navigateur intégré (Messenger, Teams, SMS…). */
function ConsigneNavigateurIntegre() {
  return (
    <div className="verdict verdict--jaune" role="status" style={{ marginTop: 0, marginBottom: 12 }}>
      <span className="verdict__pastille" aria-hidden="true">
        !
      </span>
      <span>
        Ce lien s'est ouvert dans une app (Messenger, Teams, SMS…) qui ne peut
        pas installer le site. Copie le lien et ouvre-le dans{' '}
        <strong>Chrome</strong> (Android) ou <strong>Safari</strong> (iPhone).
      </span>
    </div>
  );
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
  const { evt, installee, ios, integre, installer } = useInstall();
  const [masque, setMasque] = useState(
    () => localStorage.getItem(CLE_MASQUE) === '1',
  );

  if (installee || masque) return null;
  if (!evt && !ios && !integre) return null; // rien à proposer sur ce navigateur

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
        {integre ? (
          <>
            Ouvre ce lien dans <strong>Chrome</strong> ou <strong>Safari</strong>{' '}
            pour installer l'app.
          </>
        ) : (
          <>
            Installe l'app pour l'utiliser <strong>hors-ligne</strong>, au fond.
          </>
        )}
      </span>
      {integre ? (
        <button type="button" className="installer-banniere__action" onClick={onAide}>
          Comment ?
        </button>
      ) : evt ? (
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
  const { evt, installee, ios, integre, installer } = useInstall();

  if (!installee && integre) {
    return (
      <>
        <ConsigneNavigateurIntegre />
        <BoutonCopierLien />
        <p className="champ__aide">
          Puis, dans Chrome ou Safari : menu → « Ajouter à l'écran d'accueil »
          ou « Installer l'application ».
        </p>
      </>
    );
  }

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
