# Modèles 3D d'oreille (optionnels)

Le site sait afficher **deux** modèles 3D `.glb`, chacun optionnel. Sans
fichier, chaque emplacement affiche un repli propre (aucune erreur, aucune
scène vide).

| Fichier | Où il apparaît | Ce qu'on y montre |
|---|---|---|
| **`oreille.glb`** | Le hero d'accueil **et** le module « Ce que le bruit détruit » | L'oreille complète : externe (pavillon, conduit, tympan) et interne (cochlée) |
| **`cellules.glb`** | Le module « Ce que le bruit détruit » | Les cellules ciliées / l'organe de Corti — ce que le bruit détruit sans retour |

Dans le hero, `oreille.glb` tourne lentement en fond derrière le titre, comme le
corps 3D du hero de TMS. S'il est absent, l'accueil montre un fond d'ondes
sonores propre.

## Où trouver un modèle libre et téléchargeable

**NIH 3D — https://3d.nih.gov/** (recommandé)
: modèles anatomiques souvent du **domaine public** (aucune attribution
  requise), téléchargeables en `.glb`. Cherche `ear anatomy` pour l'oreille
  complète, `cochlea` ou `organ of Corti` pour les cellules ciliées.

**Sketchfab — https://sketchfab.com/** (filtre « Downloadable »)
: beaucoup de modèles, mais **vérifie la licence** avant de télécharger.
  CC-BY = attribution obligatoire ; CC-BY-NC = usage non commercial seulement ;
  CC0 = libre. Quelques pistes repérées (licence à vérifier au moment du
  téléchargement) :
  - Oreille complète : « Ear Anatomy » de *brianj.seely*, « Human ear anatomy »
    de *paihub*.
  - Cellules ciliées : « Inner Hair Cell » de *kj6420*, « Cochlear Ear Cilia »
    de *PARSONSARTS*, la collection « Organ of Corti » de *fluttershift*.

**Meshy — https://www.meshy.ai/tags/ear** : modèles CC0 générés, `.glb` direct.

> Si le modèle choisi demande une attribution (CC-BY), indique-le : on peut
> ajouter une ligne de crédit sous la visionneuse.

## Marche à suivre

1. Télécharge un `.glb` (oreille complète, et/ou cellules ciliées).
2. Renomme-le **`oreille.glb`** ou **`cellules.glb`** et dépose-le dans ce
   dossier (`public/models/`).
3. Reconstruis le site (`npm run build`) — ou pousse le fichier, le déploiement
   automatique s'en charge. Le hero et le module 4 l'affichent tout seuls.

Le fichier est empaqueté avec le site : une fois chargé, il est mis en cache et
fonctionne **hors-ligne** comme le reste.
