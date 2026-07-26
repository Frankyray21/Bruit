# Animations vidéo du module « Ce que le bruit détruit » (optionnelles, hors-ligne)

Le site sait jouer **deux** clips `.mp4`, chacun optionnel. Sans fichier, la
carte affiche un **lien** externe (fonctionne uniquement en ligne) ; avec le
fichier, elle joue la vidéo en boucle et **hors-ligne**.

| Fichier | Carte | Sujet |
|---|---|---|
| **`videoplayback.mp4`** | « Le voyage du son » | Le son de l'oreille au cerveau (NIDCD/NIH) |
| **`cellules.mp4`** | « Le bruit détruit la cellule ciliée » | Les cils rompus par le bruit — lésion irréversible |

## `videoplayback.mp4` — Le voyage du son

- Source officielle : https://www.nidcd.nih.gov/news/multimedia/journey-of-sound-video
- Version YouTube : https://www.youtube.com/watch?v=Ew7VXZ3sH2o
- **Licence : domaine public** (agence fédérale américaine, NIDCD/NIH).
  Réutilisation libre, sans redevance. Le site crédite déjà « NIDCD, NIH ».

## `cellules.mp4` — Le bruit détruit la cellule ciliée

Clip centré sur les cellules ciliées / l'organe de Corti abîmés par le bruit.
Pistes selon la licence recherchée :

**Libre de droit et téléchargeable (recommandé pour l'hors-ligne)**
- **Pexels — https://www.pexels.com/search/videos/cochlea/** (ou `inner ear`,
  `hair cells`, `stereocilia`) — Licence Pexels : gratuit, sans attribution,
  téléchargeable en `.mp4`, redistribuable.
- **Pixabay — https://pixabay.com/videos/search/inner%20ear/** — Licence
  Pixabay : gratuit, sans attribution, `.mp4` direct.

**Ressource pédagogique de référence (thème exact, licence à demander)**
- **cochlea.eu / « Voyage au centre de l'audition »** (R. Pujol, S. Blatrix,
  NeurOreille) — page cellules ciliées : https://www.cochlea.eu/en/hair-cells/
  — animation « Le bruit détruit la cellule ciliée » :
  https://www.youtube.com/watch?v=mZmlUvHomrA
  Contenu protégé : idéal, mais **demande l'autorisation** avant d'en héberger
  une copie (ils l'accordent souvent pour la formation). Crédit : « © R. Pujol /
  cochlea.eu — NeurOreille ».

**Payant** : Getty Images, iStock, Adobe Stock, Science Photo Library — clips
d'atteinte cochléaire, sous licence à acheter.

## Marche à suivre

1. Télécharge un `.mp4` (source libre ou avec autorisation).
2. Renomme-le **`videoplayback.mp4`** ou **`cellules.mp4`** et dépose-le dans ce
   dossier (`public/videos/`).
3. Pousse le fichier (le déploiement automatique reconstruit le site) — ou
   `npm run build`. La carte détecte le fichier et joue la vidéo à la place du
   lien.

Un `.mp4` H.264/AAC lit partout sur téléphone. Le fichier est empaqueté avec le
site : une fois chargé, il est en cache et fonctionne **hors-ligne**.
