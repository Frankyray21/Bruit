/**
 * Lecteur de modèle 3D glTF/GLB — Three.js + GLTFLoader.
 *
 * Charge un modèle anatomique que tu déposes dans `public/models/` (voir
 * README). Si le fichier est absent, `creerVisionneuse` rejette et la carte
 * React bascule sur un repli propre — jamais de scène vide.
 *
 * Tout est local : un GLB déposé dans le bundle est mis en cache et fonctionne
 * hors-ligne comme le reste du site.
 */

import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface VisionneuseGlb {
  tourner: (dx: number, dy: number) => void;
  detruire: () => void;
}

export async function creerVisionneuse(
  conteneur: HTMLElement,
  urlModele: string,
  animer: boolean,
): Promise<VisionneuseGlb> {
  // Charge le modèle d'abord : si l'URL n'existe pas, on rejette avant de
  // toucher au DOM, et la carte affiche son repli.
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(urlModele);

  const largeur = conteneur.clientWidth || 320;
  const hauteur = conteneur.clientHeight || 320;

  const scene = new Scene();
  scene.background = new Color('#0d1117');

  const camera = new PerspectiveCamera(45, largeur / hauteur, 0.01, 1000);

  const renderer = new WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(largeur, hauteur);
  conteneur.appendChild(renderer.domElement);

  scene.add(new AmbientLight(0xffffff, 0.75));
  const key = new DirectionalLight(0xffffff, 1.2);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new DirectionalLight(0xff5c73, 0.4);
  rim.position.set(-4, -1, -3);
  scene.add(rim);

  const pivot = new Group();
  const modele = gltf.scene;

  // Certains modèles n'ont pas de matériau ou sont invisibles sur fond sombre :
  // on garantit un matériau visible par défaut.
  modele.traverse((obj) => {
    if (obj instanceof Mesh && !obj.material) {
      obj.material = new MeshStandardMaterial({ color: 0xe8b7bd, roughness: 0.6 });
    }
  });

  // Recentre et met à l'échelle pour cadrer le modèle quelles que soient ses
  // dimensions d'origine.
  const boite = new Box3().setFromObject(modele);
  const taille = boite.getSize(new Vector3());
  const centre = boite.getCenter(new Vector3());
  const dmax = Math.max(taille.x, taille.y, taille.z) || 1;
  modele.position.sub(centre);
  pivot.scale.setScalar(2.4 / dmax);
  pivot.add(modele);
  scene.add(pivot);

  camera.position.set(0, 0.4, 5);
  camera.lookAt(0, 0, 0);

  let rot = 0;
  let inclin = 0;
  let temps = 0;
  let vivant = true;

  function rendre() {
    pivot.rotation.y = rot + (animer ? temps * 0.15 : 0);
    pivot.rotation.x = inclin;
    renderer.render(scene, camera);
  }

  let frame = 0;
  function boucle() {
    if (!vivant) return;
    temps += 0.016;
    rendre();
    frame = requestAnimationFrame(boucle);
  }
  boucle();

  const ro = new ResizeObserver(() => {
    const l = conteneur.clientWidth || 320;
    const h = conteneur.clientHeight || 320;
    camera.aspect = l / h;
    camera.updateProjectionMatrix();
    renderer.setSize(l, h);
  });
  ro.observe(conteneur);

  return {
    tourner: (dx, dy) => {
      rot += dx * 0.01;
      inclin = Math.max(-1.2, Math.min(1.2, inclin + dy * 0.01));
      if (!animer) rendre();
    },
    detruire: () => {
      vivant = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      scene.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.geometry?.dispose();
          const m = obj.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === conteneur) {
        conteneur.removeChild(renderer.domElement);
      }
    },
  };
}
