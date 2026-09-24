/**
 * Scène 3D de la cochlée et des cellules ciliées — Three.js.
 *
 * La coquille est la vraie cochlée (modèle anatomique, `public/models/cochlee.glb`,
 * en millimètres, axe du modiolus vertical, apex en haut). Dans ce fichier est
 * aussi enregistrée la spirale du canal cochléaire (base → apex), le long de
 * laquelle on reconstruit l'organe de Corti tel qu'il est décrit :
 *
 *   • par station, UNE cellule ciliée interne (CCI, côté modiolus, touffe en
 *     arc peu profond) et TROIS cellules ciliées externes (CCE, touffes en V
 *     ouvertes vers le modiolus, pointe vers la paroi) ;
 *   • stéréocils en escalier sur trois rangs, le rang le plus haut du côté de
 *     la paroi (strie vasculaire), le plus court du côté du modiolus ;
 *   • gradients base → apex : stéréocils et corps des CCE plus longs vers
 *     l'apex, membrane basilaire plus large vers l'apex ;
 *   • membrane tectoriale (gel translucide) posée sur les touffes des CCE ;
 *   • piliers interne et externe formant le tunnel de Corti entre CCI et CCE ;
 *   • repères de fréquence selon la carte tonotopique de Greenwood (1990).
 *
 * Le modèle de dommage (fréquences, ordre CCE → CCI, rangées) est dans
 * `tonotopie.ts`, avec ses références et ses tests.
 *
 * ⚠️ Deux libertés assumées, dites dans la carte : l'échelle des cellules est
 * exagérée (des micromètres rendus en dixièmes de millimètre) pour qu'on les
 * voie sur la cochlée entière, et le temps est compressé — la destruction
 * réelle prend des mois et des années.
 */

import {
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
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
  Sprite,
  SpriteMaterial,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { dommageCce, dommageCci, positionGreenwood } from './tonotopie.js';

/** Stations (coupes de l'organe de Corti) le long de la spirale. */
const NB_STATIONS = 56;

/** Géométrie des touffes (mm, échelle exagérée). */
const RAYON_CIL = 0.028;
/** Rangs de stéréocils d'une CCE (escalier : court → long), à la base. */
const HAUTEURS_CCE = [0.16, 0.24, 0.34];
/** Rangs d'une CCI (trois rangs, plus trapus). */
const HAUTEURS_CCI = [0.2, 0.26, 0.32];
/** Stéréocils par rang. */
const PAR_RANG = 11;

/** Repères de fréquence affichés le long de la spirale. */
const REPERES_HZ = [20000, 8000, 4000, 1000, 250];

const VERT = new Color('#7ee787');
const JAUNE = new Color('#f2c14e');
const ROUGE = new Color('#ff7a8a');
const MORT = new Color('#7a2b35');

export interface PoigneeScene {
  /** Niveau de bruit courant, 60 à 120 dBA. Pilote l'état des cellules. */
  setNiveau: (dBA: number) => void;
  /** Rotation manuelle par glissement, en radians. */
  tourner: (deltaX: number, deltaY: number) => void;
  /** Libère toutes les ressources GPU. À appeler au démontage. */
  detruire: () => void;
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

/** Pseudo-aléa déterministe dans −1 … 1 (même scène à chaque ouverture). */
function bruit(a: number, b: number): number {
  const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

interface Cil {
  /** Pied du stéréocil (mm). */
  readonly base: Vector3;
  /** Axe de basculement le long de la rangée (tangent à la spirale). */
  readonly axeTangent: Vector3;
  /** Axe de basculement radial, pour le couchage final vers la paroi. */
  readonly axeRadial: Vector3;
  readonly hauteur: number;
  /** Station 0 (base) … 1 (apex). */
  readonly s: number;
  /** Cellule interne ? Sinon externe de rangée `rangee` (0, 1, 2). */
  readonly interne: boolean;
  readonly rangee: number;
  /** Rang dans l'escalier (0 = le plus court). */
  readonly rang: number;
  /** Phase propre, pour un mouvement non synchrone. */
  readonly phase: number;
  /** Direction de désorganisation propre (−1 … 1), tirée une fois. */
  readonly desordre: number;
}

interface Corps {
  readonly base: Vector3;
  readonly s: number;
  readonly interne: boolean;
  readonly rangee: number;
  readonly longueur: number;
}

/** Dommage 0…1 d'une cellule selon son type, sa rangée et sa position. */
function dommageCellule(interne: boolean, rangee: number, s: number, niveau: number): number {
  return interne ? dommageCci(s, niveau) : dommageCce(s, niveau, rangee);
}

/** Petite étiquette de texte qui fait toujours face à la caméra. */
function etiquette(texte: string, accent: boolean): Sprite {
  const toile = document.createElement('canvas');
  toile.width = 256;
  toile.height = 96;
  const ctx = toile.getContext('2d');
  if (ctx) {
    ctx.font = '600 44px "Barlow Condensed", "Arial Narrow", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = accent ? '#ff8a99' : '#d9dee7';
    ctx.fillText(texte, 128, 48);
  }
  const texture = new CanvasTexture(toile);
  const sprite = new Sprite(
    new SpriteMaterial({ map: texture, transparent: true, depthTest: false }),
  );
  sprite.scale.set(1.5, 0.57, 1);
  sprite.renderOrder = 5;
  return sprite;
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

  // Groupe pivotant : contient la coquille, les membranes et les cellules.
  const monde = new Group();
  scene.add(monde);

  let vivant = true;
  const jetables: { dispose: () => void }[] = [];

  // --- Organe de Corti : construit une fois la spirale connue.
  let cils: Cil[] = [];
  let corps: Corps[] = [];
  let meshCils: InstancedMesh | null = null;
  let meshCorps: InstancedMesh | null = null;
  let couleursAJour = false;

  /** Ruban le long de la spirale, entre deux décalages radiaux, à une hauteur donnée. */
  function ruban(
    courbe: CatmullRomCurve3,
    interieur: (s: number) => number,
    exterieur: (s: number) => number,
    y: (s: number) => number,
    materiau: MeshStandardMaterial,
  ): Mesh {
    const haut = new Vector3(0, 1, 0);
    const sommets: number[] = [];
    const indices: number[] = [];
    const N = 180;
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const p = courbe.getPointAt(s);
      const radial = new Vector3(p.x, 0, p.z).normalize();
      const a = p.clone().addScaledVector(radial, interieur(s)).addScaledVector(haut, y(s));
      const b = p.clone().addScaledVector(radial, exterieur(s)).addScaledVector(haut, y(s));
      sommets.push(a.x, a.y, a.z, b.x, b.y, b.z);
      if (i < N) {
        const k = i * 2;
        indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(sommets, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new Mesh(geo, materiau);
    jetables.push(geo, materiau);
    return mesh;
  }

  function planter(spirale: Vector3[]) {
    const courbe = new CatmullRomCurve3(spirale);
    const haut = new Vector3(0, 1, 0);
    // Gradient base → apex : ×0,8 à la base, ×1,6 à l'apex (stéréocils, corps, largeur).
    const gradient = (s: number) => 0.8 + 0.8 * s;
    const SOL = -0.15;
    const hauteurCce3 = HAUTEURS_CCE[HAUTEURS_CCE.length - 1] ?? 0.34;

    // Membrane basilaire : s'élargit de la base vers l'apex.
    monde.add(
      ruban(
        courbe,
        (s) => -0.3 - 0.15 * gradient(s),
        (s) => 0.35 + 0.2 * gradient(s),
        () => SOL,
        new MeshStandardMaterial({
          color: new Color('#b98a8f'),
          roughness: 0.8,
          side: DoubleSide,
          transparent: true,
          opacity: 0.55,
        }),
      ),
    );

    // Membrane tectoriale : gel posé sur les touffes des CCE, du limbe à la 3e rangée.
    const tectoriale = ruban(
      courbe,
      () => -0.5,
      () => 0.06 + 2 * 0.2 + 0.14,
      (s) => SOL + hauteurCce3 * gradient(s) + 0.03,
      new MeshStandardMaterial({
        color: new Color('#f0dfb3'),
        roughness: 0.35,
        side: DoubleSide,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      }),
    );
    tectoriale.renderOrder = 3;
    monde.add(tectoriale);

    cils = [];
    corps = [];
    const piliers: { base: Vector3; sommet: Vector3 }[] = [];

    for (let i = 0; i < NB_STATIONS; i++) {
      const s = (i + 0.5) / NB_STATIONS;
      const g = gradient(s);
      const p = courbe.getPointAt(s);
      const tangente = courbe.getTangentAt(s).setY(0).normalize();
      const radial = new Vector3(p.x, 0, p.z).normalize();
      const plancher = p.clone().addScaledVector(haut, SOL);

      // Cellule interne (côté modiolus) : arc peu profond ouvert vers la paroi,
      // trois rangs en escalier, le plus haut du côté de la paroi.
      const cci = plancher.clone().addScaledVector(radial, -0.28);
      corps.push({ base: cci, s, interne: true, rangee: 0, longueur: 0.34 });
      HAUTEURS_CCI.forEach((h, rang) => {
        for (let k = 0; k < PAR_RANG; k++) {
          const u = (k - (PAR_RANG - 1) / 2) / ((PAR_RANG - 1) / 2); // -1 … 1
          const base = cci
            .clone()
            .addScaledVector(tangente, u * 0.14)
            .addScaledVector(radial, -0.04 * (1 - u * u) + 0.045 * rang);
          cils.push({
            base,
            axeTangent: tangente.clone(),
            axeRadial: radial.clone(),
            hauteur: h * g,
            s,
            interne: true,
            rangee: 0,
            rang,
            phase: i * 1.7 + k * 0.4,
            desordre: bruit(i, k),
          });
        }
      });

      // Tunnel de Corti : pilier interne et pilier externe qui se rejoignent au sommet.
      const sommetTunnel = plancher
        .clone()
        .addScaledVector(radial, -0.06)
        .addScaledVector(haut, 0.2 * g);
      piliers.push({ base: plancher.clone().addScaledVector(radial, -0.16), sommet: sommetTunnel });
      piliers.push({ base: plancher.clone().addScaledVector(radial, 0.0), sommet: sommetTunnel });

      // Trois cellules externes : touffes en V, pointe vers la paroi, trois rangs
      // en escalier (courts côté modiolus, longs côté paroi).
      for (let c = 0; c < 3; c++) {
        const cce = plancher.clone().addScaledVector(radial, 0.06 + c * 0.2);
        corps.push({ base: cce, s, interne: false, rangee: c, longueur: 0.3 * g });
        HAUTEURS_CCE.forEach((h, rang) => {
          for (let k = 0; k < PAR_RANG; k++) {
            const u = (k - (PAR_RANG - 1) / 2) / ((PAR_RANG - 1) / 2); // -1 … 1
            const base = cce
              .clone()
              .addScaledVector(tangente, u * 0.12)
              .addScaledVector(radial, 0.075 - 0.09 * Math.abs(u) + 0.04 * rang);
            cils.push({
              base,
              axeTangent: tangente.clone(),
              axeRadial: radial.clone(),
              hauteur: h * g,
              s,
              interne: false,
              rangee: c,
              rang,
              phase: i * 1.7 + c * 2.1 + k * 0.4,
              desordre: bruit(i + 3, c * PAR_RANG + k),
            });
          }
        });
      }
    }

    const geoCil = new CapsuleGeometry(RAYON_CIL, 1, 2, 6);
    geoCil.translate(0, 0.5, 0); // pied à l'origine
    const matCil = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });
    meshCils = new InstancedMesh(geoCil, matCil, cils.length);
    monde.add(meshCils);
    jetables.push(geoCil, matCil);

    const geoCorps = new CylinderGeometry(0.075, 0.06, 1, 10);
    geoCorps.translate(0, -0.5, 0); // suspendu sous la plaque cuticulaire
    const matCorps = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    meshCorps = new InstancedMesh(geoCorps, matCorps, corps.length);
    monde.add(meshCorps);
    jetables.push(geoCorps, matCorps);

    // Piliers (cellules de soutien) : cylindres fins inclinés, instanciés.
    const geoPilier = new CylinderGeometry(0.02, 0.025, 1, 6);
    geoPilier.translate(0, 0.5, 0);
    const matPilier = new MeshStandardMaterial({ color: new Color('#d8c7c0'), roughness: 0.7 });
    const meshPiliers = new InstancedMesh(geoPilier, matPilier, piliers.length);
    const objet = new Object3D();
    piliers.forEach((pl, i) => {
      const dir = pl.sommet.clone().sub(pl.base);
      objet.position.copy(pl.base);
      objet.quaternion.setFromUnitVectors(haut, dir.clone().normalize());
      objet.scale.set(1, dir.length(), 1);
      objet.updateMatrix();
      meshPiliers.setMatrixAt(i, objet.matrix);
    });
    meshPiliers.instanceMatrix.needsUpdate = true;
    monde.add(meshPiliers);
    jetables.push(geoPilier, matPilier);

    // Repères de fréquence (Greenwood), posés juste hors de la coquille.
    for (const f of REPERES_HZ) {
      const s = 1 - positionGreenwood(f);
      const p = courbe.getPointAt(Math.min(0.995, Math.max(0.005, s)));
      const radial = new Vector3(p.x, 0, p.z).normalize();
      const r = Math.hypot(p.x, p.z);
      const sp = etiquette(f >= 1000 ? `${f / 1000} kHz` : `${f} Hz`, f === 4000);
      sp.position
        .copy(p)
        .addScaledVector(radial, r / 0.62 - r + 0.9)
        .addScaledVector(haut, 0.35);
      monde.add(sp);
      const mat = sp.material;
      jetables.push(mat);
      if (mat.map) jetables.push(mat.map);
    }

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

  const fictif = new Object3D();
  const q = new Quaternion();
  const q2 = new Quaternion();
  const m4 = new Matrix4();
  const couleur = new Color();
  const pos = new Vector3();
  const echelle = new Vector3();

  function appliquer(temps: number, forcerCouleurs = false) {
    const majCouleurs = forcerCouleurs || !couleursAJour;
    if (meshCils) {
      const mc = meshCils;
      cils.forEach((c, i) => {
        const d = dommageCellule(c.interne, c.rangee, c.s, niveau);
        // Ondulation : douce quand sain, agitée sous le bruit, figée si détruit.
        const agitation = animer
          ? Math.sin(temps * 3 + c.phase) * (0.04 + niveau / 1200) * (1 - d)
          : 0;
        // 1) Désorganisation (0,25 → 0,6) : les liens de bout cassés, chaque
        //    stéréocil part de son côté, la touffe perd son escalier net.
        const desordre = Math.min(1, Math.max(0, (d - 0.25) / 0.35));
        // 2) Couchage (0,5 → 0,85) : la touffe s'affaisse vers la paroi et
        //    fusionne — les stéréocils se collent (mêmes angles).
        const couche = Math.min(1, Math.max(0, (d - 0.5) / 0.35));
        q.setFromAxisAngle(c.axeTangent, agitation + desordre * (1 - couche) * 0.9 * c.desordre);
        q2.setFromAxisAngle(c.axeRadial, -couche * 1.25);
        q.multiply(q2);
        // 3) Disparition (> 0,8) : les plus longs (les plus fragiles) d'abord.
        const seuil = 0.8 + (1 - c.rang / HAUTEURS_CCE.length) * 0.18;
        const visible = d < seuil ? 1 : 0;
        pos.copy(c.base);
        echelle.set(visible, c.hauteur * visible, visible);
        m4.compose(pos, q, echelle);
        mc.setMatrixAt(i, m4);
        if (majCouleurs) {
          if (d < 0.25) couleur.copy(VERT);
          else if (d < 0.6) couleur.copy(VERT).lerp(JAUNE, (d - 0.25) / 0.35);
          else couleur.copy(JAUNE).lerp(ROUGE, Math.min(1, (d - 0.6) / 0.3));
          mc.setColorAt(i, couleur);
        }
      });
      mc.instanceMatrix.needsUpdate = true;
      if (majCouleurs && mc.instanceColor) mc.instanceColor.needsUpdate = true;
    }
    if (meshCorps && majCouleurs) {
      const mk = meshCorps;
      corps.forEach((c, i) => {
        const d = dommageCellule(c.interne, c.rangee, c.s, niveau);
        // Mort cellulaire (> 0,8) : le corps se ratatine, la cicatrice des
        // cellules de soutien prend la place.
        const vie = 1 - 0.65 * Math.max(0, (d - 0.8) / 0.2);
        fictif.position.copy(c.base);
        fictif.scale.set(vie, c.longueur * vie, vie);
        fictif.rotation.set(0, 0, 0);
        fictif.updateMatrix();
        mk.setMatrixAt(i, fictif.matrix);
        couleur.set(c.interne ? '#efd2c4' : '#f3dcc9');
        if (d > 0.8) couleur.lerp(MORT, (d - 0.8) / 0.2);
        mk.setColorAt(i, couleur);
      });
      mk.instanceMatrix.needsUpdate = true;
      if (mk.instanceColor) mk.instanceColor.needsUpdate = true;
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
