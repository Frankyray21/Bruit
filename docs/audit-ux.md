# Audit UX — l'app en formation de travailleurs

Revue de l'expérience utilisateur menée en vue de l'usage annoncé : **former des
travailleurs miniers**, sur leur téléphone (gants, lampe frontale, sans réseau),
et en salle avec un formateur. Ce document résume la méthode, le diagnostic, ce
qui a été corrigé et ce qui reste à décider.

## Méthode

1. **Lecture du code et captures d'écran** de chaque écran (mobile 390 px et
   bureau 1366 px), plus des mesures instrumentées dans un navigateur : position
   de défilement, largeur réelle de la page, tailles de police calculées,
   contrastes WCAG, état du stockage local.
2. **Huit audits indépendants**, un angle chacun : parcours pédagogique,
   ergonomie mobile (gants, lampe), texte destiné au mauvais public,
   accessibilité, quiz et progression, cohérence des outils, défauts de code,
   usage en salle et installation.
3. **Vérification contradictoire** : chaque constat a été soumis à un
   vérificateur chargé de le réfuter en lisant le code (sept angles sur huit ;
   le huitième a été vérifié à la main).
4. **Relecture contradictoire du diff** final par un relecteur indépendant,
   puis scénarios automatisés dans un navigateur (parcours complet, quiz,
   projection, bouton Retour, remise à zéro, modèle 3D optionnel).

| | |
|---|---|
| Constats bruts | 142 |
| Constats vérifiés par un second agent | 125 |
| Confirmés | 124 |
| Réfutés | 1 (glyphe iOS : rendu seulement sur iPhone, où il s'affiche) |
| Défauts trouvés à la relecture du diff | 8, tous corrigés |

## Diagnostic

Le site était **solide sur le fond** (moteur de calcul testé ligne par ligne,
contenu traçable aux diapos, avertissements honnêtes) mais **pensé comme un
document, pas comme une formation** :

- **Aucun fil conducteur.** Six modules très longs (jusqu'à 5 400 px sur
  téléphone), un bouton « J'ai terminé » sans aucune vérification, pas de
  « module suivant », pas de reprise là où on était, et un défilement qui
  n'était jamais remis en haut : ouvrir le module 6 depuis le bas de la liste
  atterrissait au milieu du module.
- **Le travailleur lisait des notes de développeur.** Trois cartes vides lui
  demandaient de « déposer un fichier .glb », un réglage global (le facteur
  d'efficacité) lui était proposé avec la mention « la formation se
  contredit », et le kicker rouge « DIAPO 11 » était l'élément le plus visible
  de chaque carte.
- **Rien n'était mémorisé.** Changer d'onglet en plein quiz renvoyait à la
  question 1 ; le score et la date de réussite n'existaient nulle part ;
  « Mon poste » était demandé cinq fois avec cinq défauts différents.
- **Deux défauts bloquants sur téléphone.** Une ligne de crédit en `nowrap`
  élargissait la page à 680 px et faisait dézoomer tout le module 4 à 57 % ;
  la scène 3D et les courbes capturaient le balayage vertical
  (`touch-action: none`), piégeant le défilement.

## Ce qui a été fait

### Parcours
- Question de validation en fin de chaque module (tirée de la banque du quiz) ;
  « Terminé » ne s'active qu'après réponse et enchaîne sur le module suivant,
  puis sur le quiz.
- Accueil : compteur « n / 6 », bouton « Commencer / Continuer », prochain
  module mis en évidence, durée estimée par module, carte « Avant de
  descendre » au premier lancement (installer, suivre, passer le quiz).
- En-tête « Module n / 6 » avec flèche de retour et barre d'avancement ;
  titre d'onglet par écran ; défilement remis en haut à chaque écran.
- Zone et module mémorisés ; URL par écran (`#/parcours/porter`) : le bouton
  Retour du téléphone revient à l'écran précédent, un lien se partage.
- Module 3 cadré (intro + synthèse), module 4 réordonné (vidéo près de
  l'anatomie, symptômes en clôture), module 5 avec intro.

### Profil et outils
- Nom, poste et protecteur choisis une fois, repris partout (calculateurs,
  échelle des métiers, attestation).
- Boîte à outils organisée autour des trois questions du terrain, avec
  sommaire et rappel du profil.
- Curseurs de minutes avec valeurs rapides (jamais · 10 · 24 · 48 min · 4 h) ;
  réglages conservés d'un écran à l'autre ; « Mon poste, 8 h » dans le
  composeur de quart ; verdict de protection cohérent avec le choix
  simple/double.

### Quiz et attestation
- État mémorisé (place gardée), ordre des questions tiré au sort à chaque
  tentative, barre d'avancement, lettres A/B/C puis ✓/✕ (pas seulement la
  couleur), écran d'accueil (14 questions, 12 requises).
- Résultat mémorisé avec sa date ; modules à revoir en cas d'échec ;
  relecture de chaque erreur avec renvoi au module ; attestation avec nom,
  date, score et modules suivis, imprimable proprement.

### Espace du formateur
- Regroupés sous « Moi › Réglages du formateur » : projection (une carte par
  écran, ← → Espace, Échap, F plein écran, quiz avec « Révéler » pour faire
  voter la salle), facteur d'efficacité des bouchons, réinitialisation de
  l'appareil de prêt.
- Plus aucune consigne de dépôt de fichier, référence interne ou décision de
  conception dans les écrans du travailleur ; les cartes optionnelles
  (modèles 3D, clip) n'apparaissent que si le fichier existe.

### Mobile et accessibilité
- Débordement du module 4 corrigé ; scène 3D et courbes en `pan-y`.
- Pouce de curseur de 32 px, contours de contrôles à 3:1, textes secondaires
  agrandis, polices des graphiques lisibles, boutons ± 30 min et × à 56-64 px.
- Curseurs annoncés en clair (`aria-valuetext`), bascules `aria-pressed`,
  h1 par module, focus géré, minuteur annoncé, vidéo sans autoplay en
  mouvement réduit, orientation libre sur tablette.
- Indicateur « contenu téléchargé, fonctionne sans réseau » dans la carte
  d'installation ; bouton « Comment ? » sur iPhone ; frontière d'erreur par
  écran ; pas de rechargement surprise à la première visite ; le bouton
  « Vider le cache » refuse sans réseau.

## Ce qui n'a pas été fait, et pourquoi

- **Sélecteur de poste sur mesure** (liste de gros boutons au lieu du
  `<select>` natif) : le sélecteur natif d'Android et d'iPhone est déjà
  grand et utilisable avec des gants ; à revoir seulement si le test terrain
  le contredit.
- **Cochlée 3D de l'accueil** (Three.js, 568 ko) : conservée, c'est
  l'identité visuelle voulue ; elle est mise en cache après la première
  visite. Elle pourrait être remplacée par le fond d'ondes seul si la
  première ouverture est jugée trop lente.
- **Vidéo de 4,6 Mo en précache** : conservée, c'est ce qui la rend
  disponible sous terre. L'indicateur « contenu téléchargé » dit maintenant
  quand elle est prête.
- **QR code pour diffuser le lien en salle**, **détection des navigateurs
  intégrés** (Messenger, Teams) pour l'installation, **export de
  l'attestation en image** : utiles, non bloquants — voir les tâches
  suggérées.
- **Mélange de l'ordre des options** (seul l'ordre des questions est tiré au
  sort) : les explications disent « la bonne réponse est en vert », ce qui
  reste vrai ; à faire si le par-cœur devient un problème constaté.

## À trancher par le formateur et le comité SST

Ces points existaient avant l'audit et ne relèvent pas de l'interface :

1. **Facteur d'efficacité des bouchons : 60 % ou 70 %** (PLAN.md §7). Réglable
   dans « Réglages du formateur », 60 % par défaut.
2. **Surprotection** (niveau perçu sous 70 dBA) : l'avertissement est affiché
   avec la mention « ce point ne fait pas partie de la formation ».
3. **Le mineur au jackleg reste hors norme même en double protection** :
   l'écran le dit et renvoie au superviseur et au comité SST.
4. **Traçabilité** : l'attestation reste déclarative et locale ; un registre
   centralisé demanderait un serveur (PLAN.md §8).
5. **Test terrain** (Phase 5 du plan) : 3 à 5 travailleurs, avec gants, sous
   terre, en mode avion — les durées estimées par module sont à confirmer.
