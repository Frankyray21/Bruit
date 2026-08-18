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
import { Carriere, Substitution } from '../outils/Carriere.js';
import { FacteurDerating, Protection } from '../outils/Protection.js';
import { PoseBouchons, Symptomes, VerifCoquilles } from '../outils/Pose.js';
import { TempsDePort } from '../outils/TempsDePort.js';
import { AnimationSon } from '../anim3d/AnimationSon.js';
import { SerieAnnuelle } from '../ui/Graphe.js';
import { entier, nb } from '../ui/format.js';

// Modèle GLB optionnel : chargé à la demande comme la cochlée 3D.
const ModeleGlb = lazy(() => import('../anim3d/ModeleGlb.js'));

export interface Module {
  readonly id: string;
  readonly titre: string;
  readonly sousTitre: string;
  readonly diapos: string;
  readonly contenu: () => ReactNode;
}

export const MODULES: readonly Module[] = [
  {
    id: 'pourquoi',
    titre: 'Pourquoi ça compte',
    sousTitre: 'Les chiffres de la CNESST',
    diapos: 'diapos 2 et 3',
    contenu: () => <ModulePourquoi />,
  },
  {
    id: 'decibel',
    titre: 'Comprendre le décibel',
    sousTitre: 'La règle des 3 dBA, démontrée',
    diapos: 'diapos 4 à 6 et 10',
    contenu: () => <ModuleDecibel />,
  },
  {
    id: 'exposition',
    titre: 'Mon métier, mon exposition',
    sousTitre: 'Ce que la mine a mesuré',
    diapos: 'diapos 7 à 9',
    contenu: () => <ModuleExposition />,
  },
  {
    id: 'dommages',
    titre: 'Ce que le bruit détruit',
    sousTitre: 'Irréversible',
    diapos: 'diapos 11 et 12',
    contenu: () => <ModuleDommages />,
  },
  {
    id: 'choisir',
    titre: 'Choisir sa protection',
    sousTitre: 'NRR, dérating, double protection',
    diapos: 'diapos 13 et 14',
    contenu: () => <ModuleChoisir />,
  },
  {
    id: 'porter',
    titre: 'La porter correctement',
    sousTitre: 'Le geste, et le temps de port',
    diapos: 'diapos 15 à 17',
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
          aria={`Cas reconnus de surdité professionnelle par la CNESST, de ${entier(premier.cas)} en ${premier.annee} à un sommet de ${entier(sommet.cas)} en ${sommet.annee}, puis une baisse des réclamations déposées en 2020 (effet COVID sur le dépôt, non une baisse du risque) et un rebond en 2021. Cas reconnus, non l'incidence médicale ; relevé visuel, fiabilité faible.`}
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
          m'éloigne un peu » vient de l'extérieur, où elle est vraie. Le site
          n'affiche pas de chiffres ici — aucune mesure de la mine ne permet de
          les valider.
        </Avertissement>
      </Carte>
    </>
  );
}

function ModuleExposition() {
  return (
    <>
      <EchelleMetiers />
      <ComposeurQuart />
      <PostesAtelier />
      <Carriere />
    </>
  );
}

function ModuleDommages() {
  return (
    <>
      <Suspense
        fallback={
          <div className="scene3d-chargement">Chargement de la vue 3D…</div>
        }
      >
        <OreilleInterne />
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

      <AnimationSon
        fichier="videoplayback.mp4"
        titre="Le voyage du son"
        source="NIDCD · NIH"
        intro="Le son de l'oreille jusqu'au cerveau, cellules ciliées comprises. Touche le son pour l'activer."
        lien="https://www.nidcd.nih.gov/news/multimedia/journey-of-sound-video"
        lienNom="le site de la NIDCD (NIH)"
        note="domaine public"
      />

      <AnimationSon
        fichier="cellules.mp4"
        titre="Le bruit détruit la cellule ciliée"
        source="animation · optionnelle"
        intro="Les cils de la cellule ciliée pliés puis rompus par le bruit — la lésion ne se répare pas. Dépose un clip cellules.mp4 pour l'afficher ici (voir le LISEZMOI)."
        lien="https://www.cochlea.eu/en/hair-cells/"
        lienNom="cochlea.eu (NeurOreille)"
        note="ressource pédagogique — vérifie la licence avant réutilisation"
      />

      <Suspense fallback={<div className="scene3d-chargement">Chargement…</div>}>
        <ModeleGlb
          fichier="oreille.glb"
          titre="Modèle 3D de l'oreille"
          intro="Oreille externe et interne — fais glisser pour tourner le modèle."
          sujet="de l'oreille complète (externe et interne)"
          aria="Modèle 3D anatomique de l'oreille, manipulable"
          recherche="ear anatomy"
        />
      </Suspense>

      <Suspense fallback={<div className="scene3d-chargement">Chargement…</div>}>
        <ModeleGlb
          fichier="cellules.glb"
          titre="Les cellules ciliées, de près"
          intro="L'organe de Corti — ces cellules détruites par le bruit ne repoussent pas. Fais glisser pour tourner."
          sujet="des cellules ciliées (organe de Corti)"
          aria="Modèle 3D des cellules ciliées de la cochlée, manipulable"
          recherche="cochlea hair cells organ of Corti"
        />
      </Suspense>
    </>
  );
}

function ModuleChoisir() {
  return (
    <>
      <Protection />
      <Comparateur />
      <FacteurDerating />
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
