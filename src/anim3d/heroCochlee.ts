/**
 * Cochlée 3D du hero — une spirale lisse et nacrée, en rotation lente.
 *
 * Différente de la scène du module 4 (celle-ci n'a pas de cellules ciliées) :
 * ici on veut une belle forme d'accueil, reconnaissable comme la cochlée
 * (spirale en coquille), pas la démo de destruction. Générée en code, donc
 * hors-ligne, mais soignée : matériau nacré, éclairage doux, rotation lente.
 */

import {
  AmbientLight,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

export interface PoigneeHero {
  detruire: () => void;
}

export function creerHeroCochlee(
  conteneur: HTMLElement,
  animer: boolean,
): PoigneeHero {
  const largeur = conteneur.clientWidth || 320;
  const hauteur = conteneur.clientHeight || 320;

  const scene = new Scene();
  scene.background = new Color('#0a0e17');

  // Vue de trois-quarts plongeante : on regarde DANS la spirale de la cochlée,
  // qui se lit alors comme une coquille (et non un empilement de spires).
  const camera = new PerspectiveCamera(40, largeur / hauteur, 0.1, 100);
  camera.position.set(0, 6.6, 4.2);
  camera.lookAt(0, -0.3, 0);

  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(largeur, hauteur);
  conteneur.appendChild(renderer.domElement);

  scene.add(new AmbientLight(0xffffff, 0.55));
  const key = new DirectionalLight(0xffffff, 1.25);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new DirectionalLight(0xff5c73, 0.7); // liseré rouge de marque
  rim.position.set(-6, -1, -3);
  scene.add(rim);
  const glow = new PointLight(0xffd6db, 0.6, 20);
  glow.position.set(0, 0, 3);
  scene.add(glow);

  const monde = new Group();
  scene.add(monde);

  // Spirale conique de la cochlée (forme de coquille d'escargot).
  const points: Vector3[] = [];
  const tours = 2.75;
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const p = i / N;
    const angle = p * tours * Math.PI * 2;
    const rayon = 2.7 * (1 - p * 0.82); // se resserre vers l'apex
    const y = -1.5 + p * 2.6;
    points.push(new Vector3(Math.cos(angle) * rayon, y, Math.sin(angle) * rayon));
  }
  const courbe = new CatmullRomCurve3(points);

  // Tube dont le rayon diminue vers l'apex : on empile deux tubes pour simuler
  // l'effilement (base épaisse, pointe fine), plus lisible qu'un tube constant.
  const materiau = new MeshStandardMaterial({
    color: new Color('#f0c3c9'),
    roughness: 0.28,
    metalness: 0.15,
    emissive: new Color('#3a1418'),
    emissiveIntensity: 0.35,
  });

  const tubeBase = new Mesh(
    new TubeGeometry(courbe, 220, 0.52, 26, false),
    materiau,
  );
  monde.add(tubeBase);

  // Un liseré interne plus clair pour donner du relief à la coquille.
  const liseré = new Mesh(
    new TubeGeometry(courbe, 220, 0.2, 20, false),
    new MeshStandardMaterial({
      color: new Color('#fff1f3'),
      roughness: 0.2,
      metalness: 0.1,
      emissive: new Color('#7a2b30'),
      emissiveIntensity: 0.25,
    }),
  );
  monde.add(liseré);

  let temps = 0;
  let vivant = true;
  let frame = 0;

  function rendre() {
    monde.rotation.y = animer ? temps * 0.16 : 0.6;
    renderer.render(scene, camera);
  }
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
    detruire: () => {
      vivant = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      scene.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose();
          (o.material as MeshStandardMaterial).dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === conteneur) {
        conteneur.removeChild(renderer.domElement);
      }
    },
  };
}
