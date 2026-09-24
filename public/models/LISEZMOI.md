# Modèles 3D d'oreille

Le site sait afficher **deux** modèles 3D `.glb` dans le module « Ce que le
bruit détruit ». Sans fichier, l'emplacement n'affiche rien (aucune erreur,
aucune scène vide).

| Fichier | Ce qu'on y montre | État |
|---|---|---|
| **`oreille.glb`** | Oreille complète : pavillon, conduit auditif, tympan, marteau, enclume, étrier, cochlée, vestibule et canaux semi-circulaires, nerf auditif (VIII) | **présent** (voir ci-dessous) |
| **`cochlee.glb`** | La cochlée seule, dans la carte « La cochlée sous le bruit » : coquille en transparence, spirale du canal cochléaire enregistrée dans le fichier, organe de Corti reconstruit en code | **présent** (voir ci-dessous) |
| **`cellules.glb`** | Les cellules ciliées / l'organe de Corti en gros plan — emplacement optionnel | absent (optionnel) |

## `oreille.glb` — provenance et licence

Modèle anatomique réel, à l'échelle (millimètres), assemblé à partir de
[Z-Anatomy](https://github.com/Z-Anatomy) (Gauthier Kervyn et coll.,
**CC BY-SA 4.0**), lui-même dérivé de :

- **BodyParts3D** (DBCLS, Université de Tokyo, CC BY-SA 2.1 JP) — pavillon
  (fusion des régions de l'auricule gauche du fichier « Regions of human
  body » : hélix, anthélix, tragus, antitragus, conque, scapha, fosse
  triangulaire, lobule…), os temporal, nerf ;
- **« Anatomy of the Inner Ear »** (University of Dundee, d'après *3D Ear*,
  McGill, **CC BY-NC-SA 4.0**) — cochlée, vestibule, osselets, tympan.

Le **conduit auditif externe** n'existe dans aucune des sources : c'est un
tube lisse reconstruit (∅ 7 mm, courbure en S légère) du centre du tympan au
fond de la conque, soit 21 mm, la longueur réelle une fois la conque comprise.

Le nerf VIII de Z-Anatomy n'est qu'un filament tronqué au méat acoustique
interne : il est remplacé par un tronc lisse à son calibre réel (3 mm de
diamètre, 16 mm de long) qui part de la base de la cochlée (modiolus) dans la
direction du filament d'origine.

> **Attention licence.** Les pièces de Dundee sont sous clause **NC** : usage
> non commercial seulement, décision assumée par le propriétaire du site
> (formation interne). La ligne de crédit sous la visionneuse est
> obligatoire ; ne pas la retirer. La chaîne de crédit est aussi inscrite
> dans le champ `asset.copyright` du fichier.

Le modèle se refabrique avec l'outil `extraire.mjs` (décodage Draco des GLB
Z-Anatomy, lecture du FBX des régions, transformation des nœuds, écriture
d'un GLB propre par structure), conservé hors dépôt.

## `cochlee.glb` — la cochlée de l'animation « sous le bruit »

Même cochlée (Dundee via Z-Anatomy, **CC BY-NC-SA 4.0**, usage non
commercial), replacée dans un repère canonique en millimètres : origine au
centre, **Y = axe du modiolus** (apex vers le haut), X vers le vestibule
(côté de la base). Le nœud porte dans ses `extras` la **spirale du canal
cochléaire** (200 points, base → apex, 2,5 tours, 38 mm) : à chaque angle,
le rayon vaut 0,62 × celui de la paroi externe à cette hauteur (l'organe de
Corti est à mi-chemin entre le modiolus et la paroi), lissé pour rester dans
la coquille. Le sens d'enroulement est une convention, pas une mesure.

L'app (`src/anim3d/scene.ts`) plante le long de cette spirale l'organe de
Corti reconstruit : par station, une cellule ciliée interne (touffe en arc,
deux rangs) et trois externes (touffes en V pointées vers la paroi, trois
rangs en escalier), corps cellulaires et membrane basilaire. Échelle des
cellules exagérée (des micromètres rendus en dixièmes de millimètre). Sans
le fichier, une spirale conique lisse prend le relais.

## Ajouter `cellules.glb`

**NIH 3D — https://3d.nih.gov/** : modèles souvent du **domaine public**,
téléchargeables en `.glb` (`organ of Corti`, `cochlea`).
**Sketchfab** (filtre « Downloadable ») : vérifie la licence — CC-BY =
attribution ; CC-BY-NC = non commercial ; CC0 = libre.

1. Renomme le fichier **`cellules.glb`** et dépose-le dans `public/models/`.
2. Pousse : le déploiement automatique s'en charge, le module 4 l'affiche.
3. Si le modèle demande une attribution, ajoute la prop `credit` sur la carte
   dans `src/parcours/modules.tsx`.

Les fichiers sont empaquetés et précachés avec le site : une fois chargés,
ils fonctionnent **hors-ligne** comme le reste.
