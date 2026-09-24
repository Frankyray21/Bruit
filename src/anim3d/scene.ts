/**
 * Scène 3D de la cochlée et des cellules ciliées — Three.js.
 *
 * La coquille est la vraie cochlée (modèle anatomique, `public/models/cochlee.glb`,
 * en millimètres, axe du modiolus vertical, apex en haut). Dans ce fichier est
 * aussi enregistrée la spirale du canal cochléaire (base → apex), le long de
 * laquelle on plante l'organe de Corti : à chaque station, une cellule ciliée
 * interne (touffe en arc, deux rangs) et trois cellules ciliées externes
 * (touffes en V pointées vers la paroi, trois rangs de stéréocils en escalier),
 * la disposition réelle. Si le modèle manque, une spirale conique lisse prend
 * le relais — la leçon reste la même.
 *
 * ⚠️ L'échelle des cellules est exagérée (des micromètres rendus en dixièmes de
 * millimètre) pour qu'on les voie sur la cochlée entière ; et le temps est
 * compressé : la destruction réelle prend des mois et des années.
 *
 * Fait montré, réel et documenté : le bruit détruit les cellules ciliées en
 * commençant par la zone qui code les aigus (~4 kHz, près de la base), et cette
 * destruction est irréversible.
 */

import {
  AmbientLight,
  BufferGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Quaternion,
  Scene,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Stations (coupes de l'organe de Corti) le long de la spirale. */
const NB_STATIONS = 56;

/** Géométrie des touffes (mm, échelle exagérée). */
const RAYON_CIL = 0.03;
/** Rangs de stéréocils d'une cellule externe (escalier : court → long). */
const HAUTEURS_CCE = [0.17, 0.25, 0.35];
/** Rangs d'une cellule interne. */
const HAUTEURS_CCI = [0.24, 0.32];
/** Stéréocils par rang. */
const PAR_RANG = 9;

const VERT = new Color('#7ee787');
const JAUNE = new Color('#f2c14e');
const ROUGE = new Color('#ff7a8a');

export interface PoigneeScene {
  /** Niveau de bruit courant, 60 à 120 dBA. Pilote l'état des cellules. */
  setNiveau: (dBA: number) => void;
  /** Rotation manuelle par glissement, en radians. */
  tourner: (deltaX: number, deltaY: number) => void;
  /** Libère toutes les ressources GPU. À appeler au démontage. */
  detruire: () => void;
}

/**
 * Vulnérabilité d'une cellule selon sa position tonotopique.
 *
 * Pic autour de t ≈ 0,72 (la région ~4 kHz, à un bon quart de la base) : c'est
 * là que la perte auditive due au bruit commence, avant de s'étendre. Cloche.
 * t = 0 à l'apex (graves), 1 à la base (aigus).
 */
export function vulnerabilite(t: number): number {
  const centre = 0.72;
  const largeur = 0.22;
  return Math.exp(-((t - centre) ** 2) / (2 * largeur ** 2));
}

/** Fraction de dommage d'une cellule, 0 (saine) à 1 (détruite). */
export function dommage(t: number, niveauDBA: number): number {
  // Rien sous 80 dBA ; montée progressive jusqu'à saturation vers 118.
  const stress = Math.max(0, (niveauDBA - 80) / 38);
  return Math.min(1, stress * (0.35 + 0.9 * vulnerabilite(t)));
}

/** Spirale de repli (mm) si le modèle n'est pas chargé : cône de 2,5 tours. */
function spiraleParDefaut(): Vector3[] {
  const pts: Vector3[] = [];
  for (let i = 0; i <= 200; i++) {
    const s = i / 200;
    const angle = s * 2.5 * Math.PI * 2;
    const rayon = 3.0 * (1 - s * 0.6);
    pts.push(new Vector3(Math.cos(angle) * rayon, -1.5 + s * 3.4, Math.sin(angle) * rayon));
  }
  return pts;
}

interface Cil {
  /** Pied du stéréocil (mm). */
  readonly base: Vector3;
  /** Axe de basculement (horizontal, dans le plan de la touffe). */
  readonly axe: Vector3;
  readonly hauteur: number;
  /** Station 0 (base) … 1 (apex). */
  readonly s: number;
  /** Phase propre, pour un mouvement non synchrone. */
  readonly phase: number;
  /** Rang dans l'escalier (0 = le plus court) ; décale la disparition. */
  readonly rang: number;
}

interface Corps {
  readonly base: Vector3;
  readonly s: number;
  readonly externe: boolean;
}

export function creerScene(
  conteneur: HTMLElement,
  animer: boolean,
  urlModele?: string,
): PoigneeScene {
  const largeur = conteneur.clientWidth || 320;
  const hauteur = conteneur.clientHeight || 320;

  const scene = new Scene();
  scene.background = new Color('#0a0e17');

  const camera = new PerspectiveCamera(38, largeur / hauteur, 0.5, 200);
  camera.position.set(0, 5.5, 13.5);
  camera.lookAt(0, 0.3, 0);

  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(largeur, hauteur);
  conteneur.appendChild(renderer.domElement);

  scene.add(new AmbientLight(0xffffff, 0.35));
  scene.add(new HemisphereLight(0xfff1e6, 0x1a2230, 0.7));
  const key = new DirectionalLight(0xffffff, 1.3);
  key.position.set(8, 14, 10);
  scene.add(key);
  const rim = new DirectionalLight(0xff5c73, 0.45);
  rim.position.set(-10, -4, -8);
  scene.add(rim);

  // Groupe pivotant : contient la coquille, la membrane et les cellules.
  const monde = new Group();
  scene.add(monde);

  let vivant = true;
  const jetables: { dispose: () => void }[] = [];

  // --- Organe de Corti : construit une fois la spirale connue.
  let cils: Cil[] = [];
  let corps: Corps[] = [];
  let meshCils: InstancedMesh | null = null;
  let meshCorps: InstancedMesh | null = null;

  function planter(spirale: Vector3[]) {
    const courbe = new CatmullRomCurve3(spirale);
    const haut = new Vector3(0, 1, 0);

    // Membrane basilaire : un ruban le long de la spirale, du modiolus vers la paroi.
    const sommets: number[] = [];
    const indices: number[] = [];
    const NB_RUBAN = 160;
    for (let i = 0; i <= NB_RUBAN; i++) {
      const p = courbe.getPointAt(i / NB_RUBAN);
      const radial = new Vector3(p.x, 0, p.z).normalize();
      const a = p.clone().addScaledVector(radial, -0.45).addScaledVector(haut, -0.15);
      const b = p.clone().addScaledVector(radial, 0.5).addScaledVector(haut, -0.15);
      sommets.push(a.x, a.y, a.z, b.x, b.y, b.z);
      if (i < NB_RUBAN) {
        const k = i * 2;
        indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    const geoRuban = new BufferGeometry();
    geoRuban.setAttribute('position', new Float32BufferAttribute(sommets, 3));
    geoRuban.setIndex(indices);
    geoRuban.computeVertexNormals();
    const ruban = new Mesh(
      geoRuban,
      new MeshStandardMaterial({
        color: new Color('#b98a8f'),
        roughness: 0.8,
        side: DoubleSide,
        transparent: true,
        opacity: 0.55,
      }),
    );
    monde.add(ruban);
    jetables.push(geoRuban, ruban.material);

    cils = [];
    corps = [];
    for (let i = 0; i < NB_STATIONS; i++) {
      const s = (i + 0.5) / NB_STATIONS;
      const p = courbe.getPointAt(s);
      const tangente = courbe.getTangentAt(s).setY(0).normalize();
      const radial = new Vector3(p.x, 0, p.z).normalize();
      const sol = p.clone().addScaledVector(haut, -0.15);

      // Cellule interne (côté modiolus) : arc ouvert vers la paroi, deux rangs.
      const cci = sol.clone().addScaledVector(radial, -0.3);
      corps.push({ base: cci, s, externe: false });
      HAUTEURS_CCI.forEach((h, rang) => {
        for (let k = 0; k < PAR_RANG; k++) {
          const u = (k - (PAR_RANG - 1) / 2) / ((PAR_RANG - 1) / 2); // -1 … 1
          const base = cci
            .clone()
            .addScaledVector(tangente, u * 0.13)
            .addScaledVector(radial, 0.045 * (1 - u * u) - 0.045 * rang);
          cils.push({ base, axe: tangente.clone(), hauteur: h, s, phase: i * 1.7 + k * 0.4, rang });
        }
      });

      // Trois cellules externes : touffes en V, pointe vers la paroi, trois rangs en escalier.
      for (let c = 0; c < 3; c++) {
        const cce = sol.clone().addScaledVector(radial, 0.02 + c * 0.2);
        corps.push({ base: cce, s, externe: true });
        HAUTEURS_CCE.forEach((h, rang) => {
          for (let k = 0; k < PAR_RANG; k++) {
            const u = (k - (PAR_RANG - 1) / 2) / ((PAR_RANG - 1) / 2); // -1 … 1
            // V : la pointe (u = 0) est la plus proche de la paroi ; les rangs
            // courts sont vers le modiolus, les longs vers la paroi.
            const base = cce
              .clone()
              .addScaledVector(tangente, u * 0.12)
              .addScaledVector(radial, 0.07 - 0.085 * Math.abs(u) + 0.045 * rang);
            cils.push({ base, axe: tangente.clone(), hauteur: h, s, phase: i * 1.7 + c * 2.1 + k * 0.4, rang });
          }
        });
      }
    }

    const geoCil = new CapsuleGeometry(RAYON_CIL, 1, 2, 6);
    // Capsule centrée : on la décale pour que son pied soit à l'origine.
    geoCil.translate(0, 0.5, 0);
    const matCil = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });
    meshCils = new InstancedMesh(geoCil, matCil, cils.length);
    monde.add(meshCils);
    jetables.push(geoCil, matCil);

    const geoCorps = new CylinderGeometry(0.08, 0.065, 1, 10);
    geoCorps.translate(0, -0.5, 0);
    const matCorps = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    meshCorps = new InstancedMesh(geoCorps, matCorps, corps.length);
    monde.add(meshCorps);
    jetables.push(geoCorps, matCorps);
    couleursAJour = false;
  }

  // --- Coquille : le vrai modèle, sinon un tube translucide le long de la spirale.
  const loader = new GLTFLoader();
  const chargement = urlModele
    ? loader.loadAsync(urlModele).then((gltf) => {
        if (!vivant) return null;
        const trouvees: Vector3[][] = [];
        gltf.scene.traverse((obj) => {
          const brut = (obj.userData as { spirale?: number[][] }).spirale;
          if (brut) trouvees.push(brut.map(([x, y, z]) => new Vector3(x ?? 0, y ?? 0, z ?? 0)));
          if (obj instanceof Mesh) {
            const m = new MeshStandardMaterial({
              color: new Color('#f3cdd3'),
              emissive: new Color('#4a2a30'),
              emissiveIntensity: 0.35,
              roughness: 0.45,
              metalness: 0.02,
              transparent: true,
              opacity: 0.3,
              depthWrite: false,
              side: DoubleSide,
            });
            obj.material = m;
            obj.renderOrder = 2;
            jetables.push(obj.geometry, m);
          }
        });
        monde.add(gltf.scene);
        return trouvees[0] ?? null;
      })
    : Promise.resolve<Vector3[] | null>(null);

  chargement
    .catch(() => null)
    .then((spirale: Vector3[] | null) => {
      if (!vivant) return;
      let pts: Vector3[];
      if (spirale) {
        pts = spirale;
      } else {
        pts = spiraleParDefaut();
        const tube = new Mesh(
          new TubeGeometry(new CatmullRomCurve3(pts), 220, 0.9, 18, false),
          new MeshStandardMaterial({
            color: new Color('#e8b7bd'),
            roughness: 0.55,
            transparent: true,
            opacity: 0.28,
            depthWrite: false,
          }),
        );
        tube.renderOrder = 2;
        monde.add(tube);
        jetables.push(tube.geometry, tube.material);
      }
      planter(pts);
      if (!animer) {
        appliquer(0, true);
        renderer.render(scene, camera);
      }
    });

  // --- État piloté depuis React.
  let niveau = 60;
  let rotationManuelle = 0.4;
  let inclinaisonManuelle = 0;
  let horloge = 0;
  let couleursAJour = false;

  const fictif = new Object3D();
  const q = new Quaternion();
  const m4 = new Matrix4();
  const couleur = new Color();
  const pos = new Vector3();
  const echelle = new Vector3();

  function appliquer(temps: number, forcerCouleurs = false) {
    if (meshCils) {
      const mc = meshCils;
      cils.forEach((c, i) => {
        const d = dommage(1 - c.s, niveau);
        // Ondulation : douce quand sain, agitée sous le bruit, figée si détruit.
        const agitation = animer
          ? Math.sin(temps * 3 + c.phase) * (0.04 + niveau / 1200) * (1 - d)
          : 0;
        // Couchage : la touffe s'affaisse et se désorganise avec le dommage.
        const couche = d * (1.2 + 0.35 * Math.sin(c.phase * 3.1));
        q.setFromAxisAngle(c.axe, couche + agitation);
        // Stéréocil « cassé » : les derniers 20 % du dommage les font disparaître,
        // les plus longs (les plus fragiles) d'abord.
        const seuil = 0.8 + (1 - c.rang / HAUTEURS_CCE.length) * 0.18;
        const visible = d < seuil ? 1 : 0;
        pos.copy(c.base);
        echelle.set(visible, c.hauteur * visible, visible);
        m4.compose(pos, q, echelle);
        mc.setMatrixAt(i, m4);
        if (forcerCouleurs || !couleursAJour) {
          if (d < 0.35) couleur.copy(VERT);
          else if (d < 0.7) couleur.copy(VERT).lerp(JAUNE, (d - 0.35) / 0.35);
          else couleur.copy(JAUNE).lerp(ROUGE, (d - 0.7) / 0.3);
          mc.setColorAt(i, couleur);
        }
      });
      meshCils.instanceMatrix.needsUpdate = true;
      if ((forcerCouleurs || !couleursAJour) && meshCils.instanceColor) {
        meshCils.instanceColor.needsUpdate = true;
      }
    }
    if (meshCorps && (forcerCouleurs || !couleursAJour)) {
      const mk = meshCorps;
      corps.forEach((c, i) => {
        const d = dommage(1 - c.s, niveau);
        // Le corps cellulaire se ratatine quand la cellule meurt.
        const vie = 1 - 0.6 * Math.max(0, (d - 0.8) / 0.2);
        fictif.position.copy(c.base);
        fictif.scale.set(vie, (c.externe ? 0.5 : 0.4) * vie, vie);
        fictif.rotation.set(0, 0, 0);
        fictif.updateMatrix();
        mk.setMatrixAt(i, fictif.matrix);
        couleur.set(c.externe ? '#f3dcc9' : '#efd2c4');
        if (d > 0.8) couleur.lerp(new Color('#7a2b35'), (d - 0.8) / 0.2);
        mk.setColorAt(i, couleur);
      });
      meshCorps.instanceMatrix.needsUpdate = true;
      if (meshCorps.instanceColor) meshCorps.instanceColor.needsUpdate = true;
    }
    couleursAJour = true;
    monde.rotation.y = rotationManuelle + (animer ? temps * 0.1 : 0);
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
  if (animer) boucle();
  else renderer.render(scene, camera);

  function auRedimensionnement() {
    const l = conteneur.clientWidth || 320;
    const h = conteneur.clientHeight || 320;
    camera.aspect = l / h;
    camera.updateProjectionMatrix();
    renderer.setSize(l, h);
    if (!animer) renderer.render(scene, camera);
  }
  const ro = new ResizeObserver(auRedimensionnement);
  ro.observe(conteneur);

  return {
    setNiveau: (dBA) => {
      niveau = dBA;
      couleursAJour = false;
      // Si l'animation est coupée, on rend une image figée à chaque changement.
      if (!animer) {
        appliquer(0, true);
        renderer.render(scene, camera);
      }
    },
    tourner: (dx, dy) => {
      rotationManuelle += dx * 0.01;
      inclinaisonManuelle = Math.max(-0.9, Math.min(0.9, inclinaisonManuelle + dy * 0.01));
      if (!animer) {
        appliquer(0);
        renderer.render(scene, camera);
      }
    },
    detruire: () => {
      vivant = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      for (const j of jetables) j.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === conteneur) {
        conteneur.removeChild(renderer.domElement);
      }
    },
  };
}
