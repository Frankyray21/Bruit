/**
 * Scène 3D de la cochlée et des cellules ciliées — Three.js pur.
 *
 * ⚠️ C'est une illustration SCHÉMATIQUE, pas un modèle anatomique exact ni une
 * simulation médicale. Elle sert à rendre visible un fait réel et documenté :
 * le bruit détruit les cellules ciliées, en commençant par la zone qui code les
 * aigus (~4 kHz), et cette destruction est irréversible.
 *
 * Aucune ressource externe : toute la géométrie est générée en code, donc la
 * scène fonctionne hors-ligne comme le reste du site.
 */

import {
  AmbientLight,
  Color,
  CatmullRomCurve3,
  CylinderGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

/** Nombre de faisceaux de cellules ciliées le long de la spirale. */
const NB_CELLULES = 22;

/** Stéréocils par faisceau (les « poils » d'une cellule). */
const STEREOCILS = 5;

export interface PoigneeScene {
  /** Niveau de bruit courant, 60 à 120 dBA. Pilote l'état des cellules. */
  setNiveau: (dBA: number) => void;
  /** Rotation manuelle par glissement, en radians. */
  tourner: (deltaX: number, deltaY: number) => void;
  /** Libère toutes les ressources GPU. À appeler au démontage. */
  detruire: () => void;
}

interface Cellule {
  readonly groupe: Group;
  readonly stereocils: Mesh[];
  /** Position tonotopique, 0 = apex (graves) à 1 = base (aigus). */
  readonly t: number;
  /** Phase d'ondulation propre, pour un mouvement non synchrone. */
  readonly phase: number;
}

/**
 * Vulnérabilité d'une cellule selon sa position tonotopique.
 *
 * Pic autour de t ≈ 0,72 (la région ~4 kHz près de la base) : c'est là que la
 * perte auditive due au bruit commence, avant de s'étendre. Courbe en cloche.
 */
function vulnerabilite(t: number): number {
  const centre = 0.72;
  const largeur = 0.22;
  return Math.exp(-((t - centre) ** 2) / (2 * largeur ** 2));
}

/** Fraction de dommage d'une cellule, 0 (saine) à 1 (détruite). */
function dommage(t: number, niveauDBA: number): number {
  // Rien sous 80 dBA ; montée progressive jusqu'à saturation vers 118.
  const stress = Math.max(0, (niveauDBA - 80) / 38);
  return Math.min(1, stress * (0.35 + 0.9 * vulnerabilite(t)));
}

export function creerScene(
  conteneur: HTMLElement,
  animer: boolean,
): PoigneeScene {
  const largeur = conteneur.clientWidth || 320;
  const hauteur = conteneur.clientHeight || 320;

  const scene = new Scene();
  scene.background = new Color('#0d1117');

  const camera = new PerspectiveCamera(42, largeur / hauteur, 0.1, 100);
  camera.position.set(0, 1.2, 8.5);
  camera.lookAt(0, 0.2, 0);

  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(largeur, hauteur);
  conteneur.appendChild(renderer.domElement);

  scene.add(new AmbientLight(0xffffff, 0.65));
  const key = new DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 6, 5);
  scene.add(key);
  const rim = new DirectionalLight(0xff5c73, 0.5);
  rim.position.set(-5, -2, -4);
  scene.add(rim);

  // Groupe pivotant : contient la spirale et les cellules.
  const monde = new Group();
  monde.rotation.x = -0.35;
  scene.add(monde);

  // --- La cochlée : un tube le long d'une spirale conique (forme d'escargot).
  const points: Vector3[] = [];
  const tours = 2.6;
  for (let i = 0; i <= 160; i++) {
    const p = i / 160;
    const angle = p * tours * Math.PI * 2;
    const rayon = 2.6 * (1 - p * 0.72);
    const y = -1.4 + p * 2.4;
    points.push(new Vector3(Math.cos(angle) * rayon, y, Math.sin(angle) * rayon));
  }
  const courbe = new CatmullRomCurve3(points);
  const tube = new Mesh(
    new TubeGeometry(courbe, 200, 0.42, 20, false),
    new MeshStandardMaterial({
      color: new Color('#e8b7bd'),
      roughness: 0.55,
      metalness: 0.05,
      transparent: true,
      opacity: 0.32,
    }),
  );
  monde.add(tube);

  // --- Les cellules ciliées, plantées le long de la spirale, poils vers l'extérieur.
  const cellules: Cellule[] = [];
  const geoCil = new CylinderGeometry(0.012, 0.03, 0.55, 6);

  for (let i = 0; i < NB_CELLULES; i++) {
    const t = (i + 0.5) / NB_CELLULES;
    const point = courbe.getPointAt(t);
    const tangente = courbe.getTangentAt(t);

    const groupe = new Group();
    groupe.position.copy(point);
    // Oriente le faisceau : « debout » par rapport à la surface du tube.
    const normale = new Vector3(point.x, 0, point.z).normalize();
    groupe.lookAt(point.clone().add(normale));

    const stereocils: Mesh[] = [];
    for (let s = 0; s < STEREOCILS; s++) {
      const cil = new Mesh(
        geoCil,
        new MeshStandardMaterial({
          color: new Color('#7ee787'),
          roughness: 0.4,
          emissive: new Color('#0b3d14'),
          emissiveIntensity: 0.3,
        }),
      );
      // Éventail en V, caractéristique des stéréocils.
      const dx = (s - (STEREOCILS - 1) / 2) * 0.09;
      cil.position.set(dx, 0.28, 0.42);
      cil.rotation.z = -dx * 1.4;
      groupe.add(cil);
      stereocils.push(cil);
    }

    monde.add(groupe);
    cellules.push({ groupe, stereocils, t, phase: i * 1.7 });
  }

  // --- État piloté depuis React.
  let niveau = 60;
  let rotationManuelle = 0;
  let inclinaisonManuelle = -0.35;
  let horloge = 0;
  let vivant = true;

  function appliquer(temps: number) {
    for (const c of cellules) {
      const d = dommage(c.t, niveau);

      c.stereocils.forEach((cil, s) => {
        // Ondulation : douce quand sain, agitée sous le bruit, figée si détruit.
        const agitation = animer ? Math.sin(temps * 3 + c.phase + s) * (0.05 + niveau / 900) : 0;
        // Couchage : le faisceau s'affaisse avec le dommage.
        const couche = d * 1.35;
        cil.rotation.x = couche + agitation * (1 - d);

        // Cellule « cassée » : les derniers 20 % de dommage font disparaître
        // et rougir les stéréocils un à un.
        const seuilDisparition = 0.8 + (s / STEREOCILS) * 0.2;
        cil.visible = d < seuilDisparition;
        const mat = cil.material as MeshStandardMaterial;
        mat.color.setHex(d > 0.55 ? 0xff7a8a : 0x7ee787);
        mat.emissive.setHex(d > 0.55 ? 0x5a0f16 : 0x0b3d14);
      });
    }
    monde.rotation.y = rotationManuelle + (animer ? temps * 0.12 : 0);
    monde.rotation.x = inclinaisonManuelle;
  }

  let frame = 0;
  function boucle() {
    if (!vivant) return;
    horloge += 0.016;
    appliquer(horloge);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(boucle);
  }
  boucle();

  function auRedimensionnement() {
    const l = conteneur.clientWidth || 320;
    const h = conteneur.clientHeight || 320;
    camera.aspect = l / h;
    camera.updateProjectionMatrix();
    renderer.setSize(l, h);
  }
  const ro = new ResizeObserver(auRedimensionnement);
  ro.observe(conteneur);

  return {
    setNiveau: (dBA) => {
      niveau = dBA;
      // Si l'animation est coupée, on rend une image figée à chaque changement.
      if (!animer) {
        appliquer(0);
        renderer.render(scene, camera);
      }
    },
    tourner: (dx, dy) => {
      rotationManuelle += dx * 0.01;
      inclinaisonManuelle = Math.max(-1.2, Math.min(0.4, inclinaisonManuelle + dy * 0.01));
      if (!animer) {
        appliquer(0);
        renderer.render(scene, camera);
      }
    },
    detruire: () => {
      vivant = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      scene.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.geometry.dispose();
          const m = obj.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === conteneur) {
        conteneur.removeChild(renderer.domElement);
      }
    },
  };
}
