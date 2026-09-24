/**
 * Les 6 modules du parcours.
 *
 * Les 17 diapos de la formation réorganisées : chaque diapo devient soit un
 * outil manipulable, soit du contenu assumé comme statique. Rien entre les deux.
 *
 * Ordre pédagogique important : la sommation de sources (module 2) doit
 * précéder tout calcul de dose. C'est elle qui rend la règle des 3 dBA
 * démontrable ; sans elle, tout le reste repose sur un axiome à croire.
 */

import { lazy, Suspense, type ReactNode } from 'react';
import { statistiques } from '../data/index.js';
import { Avertissement, Carte, Declic } from '../ui/composants.js';

// La 3D (Three.js) n'est téléchargée qu'à l'ouverture du module 4 : elle ne
// pèse pas sur le démarrage des calculateurs. Une fois chargée, elle est en
// cache et fonctionne hors-ligne comme le reste.
const OreilleInterne = lazy(() => import('../anim3d/OreilleInterne.js'));
import { ComposeurQuart } from '../outils/ComposeurQuart.js';
import { Comparateur } from '../outils/Comparateur.js';
import { DureePermise, EchelleMetiers, PostesAtelier } from '../outils/DureePermise.js';
import { EchelleEnergie, SommationSources } from '../outils/SommationSources.js';
import { BudgetRetrait } from '../outils/BudgetRetrait.js';
import { Substitution } from '../outils/Carriere.js';
import { Protection } from '../outils/Protection.js';
import { PoseBouchons, Symptomes, VerifCoquilles } from '../outils/Pose.js';
import { TempsDePort } from '../outils/TempsDePort.js';
import { OreilleCoupe } from '../anim3d/OreilleCoupe.js';
import { AnimationSon } from '../anim3d/AnimationSon.js';
import { SerieAnnuelle } from '../ui/Graphe.js';
import { entier, nb } from '../ui/format.js';

// Modèle GLB optionnel : chargé à la demande comme la cochlée 3D.
const ModeleGlb = lazy(() => import('../anim3d/ModeleGlb.js'));

/** Couleurs des matériaux du fichier `public/models/oreille.glb`. */
const LEGENDE_OREILLE = [
  { couleur: '#e3a891', nom: 'Pavillon' },
  { couleur: '#edbda9', nom: 'Conduit auditif' },
  { couleur: '#fadbd1', nom: 'Tympan' },
  { couleur: '#f5eed9', nom: 'Osselets (marteau, enclume, étrier)' },
  { couleur: '#edb8ad', nom: 'Cochlée' },
  { couleur: '#dbcca8', nom: 'Vestibule et canaux semi-circulaires' },
  { couleur: '#f5c74d', nom: 'Nerf auditif (VIII)' },
] as const;

export interface Module {
  readonly id: string;
  readonly titre: string;
  readonly sousTitre: string;
  readonly diapos: string;
  /** Durée honnête, mesurée en défilant le module sur un téléphone. */
  readonly duree: string;
  /** Ce que le travailleur doit retenir en sortant — une phrase. */
  readonly objectif: string;
  readonly contenu: () => ReactNode;
}

export const MODULES: readonly Module[] = [
  {
    id: 'pourquoi',
    titre: 'Pourquoi ça compte',
    sousTitre: 'Les chiffres de la CNESST',
    diapos: 'diapos 2 et 3',
    duree: '≈ 3 min',
    objectif:
      'Comprendre que la surdité professionnelle explose au Québec et touche des travailleurs de plus en plus jeunes.',
    contenu: () => <ModulePourquoi />,
  },
  {
    id: 'decibel',
    titre: 'Comprendre le décibel',
    sousTitre: 'La règle des 3 dBA, démontrée',
    diapos: 'diapos 4 à 6 et 10',
    duree: '≈ 8 min',
    objectif:
      'Retenir la règle des 3 dBA : trois décibels de plus, deux fois moins de temps permis.',
    contenu: () => <ModuleDecibel />,
  },
  {
    id: 'exposition',
    titre: 'Mon métier, mon exposition',
    sousTitre: 'Ce que la mine a mesuré',
    diapos: 'diapos 7 à 9',
    duree: '≈ 7 min',
    objectif:
      'Situer ton poste sur l’échelle et voir à quelle heure ta dose du quart est atteinte.',
    contenu: () => <ModuleExposition />,
  },
  {
    id: 'dommages',
    titre: 'Ce que le bruit détruit',
    sousTitre: 'Irréversible',
    diapos: 'diapos 11 et 12',
    duree: '≈ 6 min',
    objectif:
      'Voir ce que le bruit détruit dans l’oreille, et reconnaître les signes qui imposent d’aller consulter.',
    contenu: () => <ModuleDommages />,
  },
  {
    id: 'choisir',
    titre: 'Choisir sa protection',
    sousTitre: 'NRR, dérating, double protection',
    diapos: 'diapos 13 et 14',
    duree: '≈ 6 min',
    objectif:
      'Savoir ce que ton protecteur vaut vraiment sur le terrain, et quand la double protection s’impose.',
    contenu: () => <ModuleChoisir />,
  },
  {
    id: 'porter',
    titre: 'La porter correctement',
    sousTitre: 'Le geste, et le temps de port',
    diapos: 'diapos 15 à 17',
    duree: '≈ 6 min',
    objectif:
      'Poser ses bouchons correctement, et mesurer ce que coûtent dix minutes sans protection.',
    contenu: () => <ModulePorter />,
  },
];

function ModulePourquoi() {
  const { coutsReclamations: couts, nouveauxCasAcceptes: cas } = statistiques;
  const serie = cas.series;
  const premier = serie[0]!;
  const sommet = serie.reduce((max, p) => (p.cas > max.cas ? p : max), premier);

  return (
    <>
      <Carte
        titre="La surdité professionnelle au Québec"
        source="diapo 2"
        intro="Nouveaux cas reconnus par la CNESST, chaque année. Le creux de 2020 reflète moins de réclamations déposées (COVID), pas une baisse du risque."
      >
        <SerieAnnuelle
          points={serie.map((p) => ({ annee: p.annee, valeur: p.cas }))}
          yMax={15000}
          graduationsY={[0, 5000, 10000, 15000]}
          reperesAnnees={[1997, 2003, 2009, 2015, 2021]}
          marques={[
            { annee: premier.annee, label: entier(premier.cas), cote: 'droite' },
            { annee: sommet.annee, label: entier(sommet.cas), cote: 'haut' },
            { annee: 2020, label: '', cote: 'haut', attenue: true },
          ]}
          aria={`Cas reconnus de surdité professionnelle par la CNESST, de ${entier(premier.cas)} en ${premier.annee} à un sommet de ${entier(sommet.cas)} en ${sommet.annee}, puis une baisse des réclamations déposées en 2020 (effet COVID sur le dépôt, non une baisse du risque) et un rebond en 2021. Cas reconnus par la CNESST, non l'incidence médicale.`}
        />

        <Declic>
          Les cas <strong>reconnus</strong> par la CNESST ont été multipliés par{' '}
          <strong>{nb((sommet.cas / premier.cas), 1)}</strong> entre{' '}
          {premier.annee} et {sommet.annee}.
        </Declic>

        <Avertissement>
          Une partie de cette hausse vient d'une meilleure reconnaissance des
          réclamations, pas seulement d'une aggravation réelle. Le constat le
          plus solide de la formation est ailleurs :{' '}
          <strong>les réclamants sont de plus en plus jeunes</strong>.
        </Avertissement>
      </Carte>

      <Carte titre="Ce que ça coûte" source="diapo 3">
        <div className="resultat">
          <div className="resultat__etiquette">
            {couts.nombreCas.toLocaleString('fr-CA')} cas entre{' '}
            {couts.periode}
          </div>
          <div className="resultat__valeur">
            {nb((couts.totalRecalcule_CAD / 1e6), 1)} M$
          </div>
          <div className="resultat__note">
            à {couts.coutMoyenParCas_CAD.toLocaleString('fr-CA')} $ par
            réclamation
          </div>
        </div>
        <p className="carte__intro" style={{ marginTop: 14, marginBottom: 0 }}>
          Mais un chèque ne rend pas l'audition. C'est tout l'objet de ce qui
          suit.
        </p>
      </Carte>
    </>
  );
}

function ModuleDecibel() {
  return (
    <>
      <Carte titre="Deux instruments, deux unités" source="diapo 4">
        <ul className="liste-puces">
          <li>
            Le <strong>sonomètre</strong> mesure le bruit à l'instant même, en{' '}
            <strong>décibels (dB)</strong>.
          </li>
          <li>
            Le <strong>dosimètre</strong> mesure ce que l'oreille encaisse sur
            une période, en <strong>décibels corrigés (dBA)</strong>. Ce sont
            les mesures effectuées par la mine.
          </li>
          <li>
            <strong>À chaque 3 dBA, l'impact sur l'oreille est doublé.</strong>
          </li>
        </ul>
        <p
          className="carte__intro"
          style={{ marginTop: 12, marginBottom: 0, fontSize: '0.82rem' }}
        >
          <strong>Précision —</strong> le « A » de dBA est une{' '}
          <strong>pondération en fréquence</strong> : elle atténue les graves,
          comme le fait l'oreille. Les deux appareils mesurent en dBA ; la vraie
          différence, c'est que le sonomètre lit l'<strong>instant</strong> et le
          dosimètre <strong>cumule</strong> sur la durée du quart.
        </p>
      </Carte>

      <SommationSources />
      <EchelleEnergie />
      <DureePermise />

      <Carte titre="Comment le son se propage" source="diapo 10">
        <ul className="liste-puces">
          <li>
            <strong>Aérienne</strong> : le son se propage dans l'air.
          </li>
          <li>
            <strong>Solidienne</strong> : il se transmet dans les éléments
            solides — plancher, murs, plafond.
          </li>
          <li>
            <strong>Réverbération</strong> : il rebondit selon les matériaux.
            Une galerie en tôle nue renvoie tout ; un panneau absorbant poreux
            l'avale.
          </li>
        </ul>
        <Avertissement>
          Dans une galerie réverbérante, <strong>reculer ne sert presque à
          rien</strong> : le niveau reste quasi constant. L'intuition « je
          m'éloigne un peu » vient de l'extérieur, où elle est vraie. Il n'y a
          pas de chiffre à retenir ici : seule une mesure sur place peut le
          dire.
        </Avertissement>
      </Carte>
    </>
  );
}

function ModuleExposition() {
  return (
    <>
      <Carte
        titre="Ce que la mine a mesuré"
        intro="Trois étapes : trouve ton poste sur l'échelle, compose ton quart tâche par tâche, puis vérifie avec les postes d'atelier mesurés. Le chiffre à retenir : l'heure à laquelle ta dose du quart est atteinte."
      >
        <ul className="liste-puces">
          <li>
            <strong>Treize postes mesurés</strong>, tous au-dessus de la norme.
          </li>
          <li>
            <strong>Neuf tâches</strong> pour composer ton quart et voir la dose
            monter.
          </li>
          <li>
            <strong>Six postes d'atelier</strong> pour vérifier que le calcul
            colle à la réalité.
          </li>
        </ul>
      </Carte>
      <EchelleMetiers />
      <ComposeurQuart />
      <PostesAtelier />
      <Declic>
        <strong>À retenir :</strong> sans protection, aucun poste souterrain ne
        tient huit heures, et une seule tâche bruyante peut consommer la dose
        du quart avant la pause. Le silence n'efface rien — il ne fait que ne
        rien ajouter. La suite : ce que ce bruit détruit, puis comment se
        protéger.
      </Declic>
    </>
  );
}

function ModuleDommages() {
  return (
    <>
      <OreilleCoupe />

      <AnimationSon
        fichier="videoplayback.mp4"
        titre="Le voyage du son"
        source="NIDCD · NIH"
        intro="Le son de l'oreille jusqu'au cerveau, cellules ciliées comprises. Touche la vidéo pour la lancer."
        lien="https://www.nidcd.nih.gov/news/multimedia/journey-of-sound-video"
        lienNom="le site de la NIDCD (NIH)"
        note="domaine public"
      />

      <Suspense
        fallback={
          <div className="scene3d-chargement">Chargement de la vue 3D…</div>
        }
      >
        <OreilleInterne />
      </Suspense>

      {/* Compléments optionnels : n'apparaissent que si le fichier est déposé
          dans public/ (voir les LISEZMOI). Absents, rien ne s'affiche. */}
      <AnimationSon
        fichier="cellules.mp4"
        titre="Le bruit détruit la cellule ciliée"
        source="animation"
        intro="Les cils de la cellule ciliée pliés puis rompus par le bruit — la lésion ne se répare pas."
        lien="https://www.cochlea.eu/en/hair-cells/"
        lienNom="cochlea.eu (NeurOreille)"
        note="ressource pédagogique"
        optionnel
      />

      <Suspense fallback={null}>
        <ModeleGlb
          fichier="oreille.glb"
          titre="L'oreille complète, en vrai 3D"
          intro="Modèle anatomique à l'échelle, du pavillon au nerf : le conduit, le tympan, les trois osselets, la cochlée (l'escargot) et le vestibule. Fais glisser pour tourner."
          aria="Modèle 3D anatomique de l'oreille complète, manipulable"
          legende={LEGENDE_OREILLE}
          credit={
            <>
              Modèle :{' '}
              <a href="https://github.com/Z-Anatomy" target="_blank" rel="noopener noreferrer">
                Z-Anatomy
              </a>{' '}
              (CC BY-SA 4.0), d'après BodyParts3D (DBCLS, CC BY-SA 2.1 JP) et « Anatomy of the
              Inner Ear » (University of Dundee, CC BY-NC-SA 4.0, d'après 3D Ear, McGill).
              Usage non commercial pour la cochlée, le vestibule, les osselets et le tympan.
              Conduit auditif reconstruit.
            </>
          }
        />
      </Suspense>

      <Suspense fallback={null}>
        <ModeleGlb
          fichier="cellules.glb"
          titre="Les cellules ciliées, de près"
          intro="L'organe de Corti — ces cellules détruites par le bruit ne repoussent pas. Fais glisser pour tourner."
          aria="Modèle 3D des cellules ciliées de la cochlée, manipulable"
        />
      </Suspense>

      <Carte titre="Les quatre atteintes" source="diapo 12">
        <ul className="liste-puces">
          <li>
            <strong>Surdité brutale</strong> — un bruit soudain et intense, une
            déflagration : lésions immédiates et définitives, parfois déchirure
            du tympan.
          </li>
          <li>
            <strong>Surdité progressive</strong> — fréquente chez les foreurs.
            Exposition continue, destruction des cellules ciliées, perte{' '}
            <strong>irréversible</strong>.
          </li>
          <li>
            <strong>Acouphènes</strong> — bourdonnements ou sifflements
            permanents, même dans le silence.
          </li>
          <li>
            <strong>Hyperacousie</strong> — hypersensibilité anormale aux sons.
          </li>
        </ul>
      </Carte>

      <Carte titre="Et le reste du corps" source="diapo 12">
        <ul className="liste-puces">
          <li>Stress et fatigue</li>
          <li>Perturbation du sommeil</li>
          <li>
            Risque accru de maladies cardiovasculaires, dont l'hypertension
            artérielle
          </li>
          <li>Baisse de concentration, donc de qualité de travail</li>
        </ul>
      </Carte>

      <Symptomes />
    </>
  );
}

function ModuleChoisir() {
  return (
    <>
      <Carte
        titre="Ce que vaut vraiment un protecteur"
        source="diapos 13 et 14"
        intro="Le chiffre sur la boîte (NRR) vient d'un laboratoire. Sur le terrain, on en retire une partie seulement — et deux protecteurs ne s'additionnent pas. Trois outils pour voir ce que ta protection vaut à ton poste."
      >
        <ul className="liste-puces">
          <li>
            <strong>Bouchons</strong> : mousse (NRR 32-33) ou sur arceau (NRR
            17-20).
          </li>
          <li>
            <strong>Coquilles</strong> montées sur casque (NRR 25).
          </li>
          <li>
            <strong>Double protection</strong> recommandée au-delà de 105 dBA.
          </li>
        </ul>
      </Carte>
      <Protection />
      <Comparateur />
      <Substitution />
    </>
  );
}

function ModulePorter() {
  return (
    <>
      <PoseBouchons />
      <VerifCoquilles />
      <TempsDePort />
      <BudgetRetrait />

      <Carte titre="Les trois gestes qui comptent" source="diapo 17">
        <ul className="liste-puces">
          <li>
            <strong>Choisir</strong> le bon type de protection, adapté à sa
            condition.
          </li>
          <li>
            <strong>Installer</strong> la protection correctement.
          </li>
          <li>
            <strong>Porter</strong> la protection en tout temps.
          </li>
        </ul>
      </Carte>
    </>
  );
}
