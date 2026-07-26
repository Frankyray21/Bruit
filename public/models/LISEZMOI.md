# Modèle 3D d'oreille (optionnel)

Dépose ici un fichier **`oreille.glb`** et il sera utilisé à deux endroits :

1. **Le hero d'accueil** — le modèle tourne lentement en fond derrière le titre,
   comme le corps 3D du hero de TMS. Sans fichier, l'accueil affiche un fond
   d'ondes sonores propre (aucune forme générée par code).
2. **Le module « Ce que le bruit détruit »** — une visionneuse qu'on tourne au
   doigt.

## Où trouver un modèle libre

- **NIH 3D** — https://3d.nih.gov/ — modèles anatomiques, souvent du domaine
  public, téléchargeables en `.glb`. Cherche « ear » ou « cochlea ».
- **Sketchfab** — filtre « Downloadable » + licence CC. Attention : beaucoup
  sont en CC-BY (attribution obligatoire) ou CC-BY-NC (usage non commercial) —
  vérifie la licence avant.

## Marche à suivre

1. Télécharge un `.glb` d'oreille.
2. Renomme-le **`oreille.glb`** et dépose-le dans ce dossier (`public/models/`).
3. Reconstruis le site (`npm run build`). Le hero et le module 4 l'affichent
   automatiquement.

Le fichier est empaqueté avec le site, donc il fonctionne hors-ligne.
