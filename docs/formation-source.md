# Contenu source — Formation sur le bruit MRI 2025

Transcription intégrale du document `Formation_sur_le_bruit_MRI_2025.pdf` (17 diapos).
Ce fichier est la **source de vérité** du contenu pédagogique de l'application :
tout module de formation doit être traçable jusqu'à une diapo listée ici.

Les diapos 2, 6, 8, 9, 10, 11 et 13 sont des images ; leur contenu a été relevé
visuellement et est transcrit ci-dessous.

---

## Diapo 1 — Titre

> INFORMATIONS PROTECTION AUDITIVE 2025

## Diapo 2 — Graphique : cas de surdité professionnelle acceptés par la CNESST

Titre exact porté par l'image : **« Les nouveaux cas de surdité professionnelle
acceptés par la CNESST »**. Histogramme jaune à sommets arrondis, étiquettes
rouges, **sans axe Y ni échelle** — chaque barre porte sa valeur.

| Année | Cas | Année | Cas | Année | Cas | Année | Cas | Année | Cas |
|---|---|---|---|---|---|---|---|---|---|
| 1997 | 1 540 | 2002 | 2 397 | 2007 | 2 964 | 2012 | 4 612 | 2017 | 9 341 |
| 1998 | 1 722 | 2003 | 2 524 | 2008 | 3 363 | 2013 | 5 609 | 2018 | 12 007 |
| 1999 | 1 753 | 2004 | 2 364 | 2009 | 3 810 | 2014 | 6 662 | 2019 | **13 712** |
| 2000 | 1 994 | 2005 | 2 415 | 2010 | 4 341 | 2015 | 7 843 | 2020 | 10 550 |
| 2001 | 2 261 | 2006 | 2 674 | 2011 | 4 321 | 2016 | 8 412 | 2021 | 12 506 |

Sommet historique en 2019, creux en 2020 (−23,1 %, effet probable de la COVID sur
le dépôt des réclamations), rebond en 2021. Facteur 1997 → 2019 : **×8,90**.

> ✅ **Ces valeurs sont corroborées.** La somme des cas 1997-2010 relevés sur ce
> graphique donne **36 122**, contre **36 188** annoncés à la diapo 3 — une source
> textuelle indépendante. Écart de 66 cas, soit **0,18 %**. Le relevé visuel est
> donc fiable ; la réserve initiale sur la basse résolution est levée.
>
> ⚠️ En revanche, une part de cette hausse est **administrative** (meilleure
> reconnaissance des réclamations, campagnes de dépistage) et non
> épidémiologique. Écrire « les cas **reconnus** ont été multipliés par 9 ».
>
> Données complètes dans `data/statistiques-cnesst.json`.

## Diapo 3 — Effets sur les coûts CNESST

> Entre 1997 et 2010
> - 36 188 cas de surdité professionnelle au Québec
> - 5 660 $ par cas
>
> **TOTAL : 204 813 300 $**
>
> LES RÉCLAMATIONS VIENNENT DE TRAVAILLEURS DE PLUS EN PLUS JEUNES
> *(Source INSPQ)*

> ⚠️ 36 188 × 5 660 $ = 204 824 080 $, et non 204 813 300 $ — écart de ~10 800 $
> dans la diapo d'origine. Sans conséquence pédagogique, mais à corriger si le
> chiffre est repris tel quel.

## Diapo 4 — Mesure du bruit

> - Le bruit se mesure à l'aide d'un **sonomètre** et l'unité de mesure est le
>   décibel (dB). Au moment même, LIVE.
> - Pour connaître la perception de l'oreille, le bruit se mesure en **décibel
>   corrigé (dBA)**. (Sur une période donnée avec un **dosimètre**.) Mesures
>   effectuées par la mine.
> - **À chaque 3 dBA, l'impact sur le système auditif est doublé.**

## Diapo 5 — Limite réglementaire d'exposition sur 8 heures

> Au Québec, la limite d'exposition au bruit en milieu de travail est de
> **85 dBA pour une exposition de 8 heures**, et diminue avec la durée.
> Par exemple, 4 heures d'exposition sont limitées à 88 dBA, et 1 heure à 94 dBA.

## Diapo 6 — Niveaux d'exposition (Article 137 RSST)

| Niveau de pression acoustique continu équivalent (dBA) | Durée maximale permise par jour |
|---|---|
| 82 | 16 heures |
| 83 | 12 heures |
| 85 | 8 heures |
| 88 | 4 heures |
| 91 | 2 heures |
| 94 | 1 heure |

## Diapo 7 — Mesures selon métier

| Métier | Valeur mesurée (dBA) |
|---|---|
| Mineur conventionnel (jackleg) | 114,9 |
| Foreur long trou | 97,8 |
| Foreur au diamant | 95,5 |
| Câbleur | 100,1 |
| Opérateur de chargeuse-navette | 99,5 |
| Préposé au transfert | 98,0 |
| Opérateur de boulonneuse | 96,5 |
| Préposé au camion de service | 94,8 |
| Opérateur de marteau | 90,7 |
| Superviseur | 89,3 |
| Mécanicien S/T | 90,9 |
| Mécanicien-soudeur atelier MRI | 92,5 |
| Électricien S/T | 87,3 |

## Diapo 8 — Mesures selon métier (tâches d'atelier)

| Tâche | LEQ (dBA) |
|---|---|
| Ambiant en pause | 66 |
| Cabine à Sunblast | 88 |
| Impact drill | 98 |
| Fraisage | 85 |
| Meulage | 95 |
| Marteau aiguille | 92 |
| Drill à air (vissage) | 103 |
| Drill à batterie (vissage) | 100 |
| Jet d'air | 91 |

## Diapo 9 — Mesures selon métier (postes d'atelier, Leq 8 h)

> TABLEAU DES RÉSULTATS — Norme (RSST) et SANTÉ AU TRAVAIL : 85 dBA / 8 heures

| Emplacement | Leq 8 h | Remarques |
|---|---|---|
| Soudeur 1 | 91 | Meulage – marteau aiguille – soudage (nettoyage de l'environnement de travail en après-midi) |
| Soudeur 2 | 88 | Tâches variées en atelier (nettoyage en après-midi) |
| Mécanicien 1 atelier | 84 | Soudage – meulage – assemblage (nettoyage en après-midi) |
| Mécanicien 2 atelier | 96 | Impact drill – intérieur panier du 416 (nettoyage en après-midi) |
| Mécanicien aux composantes | 90 | Marteau – meulage – sablage (nettoyage en après-midi) |
| Électricien | 82 | En salle électrique avec radio (69). Moins d'une heure en avant-midi dans l'atelier mécanique, même chose en après-midi |

## Diapo 10 — Propagation du son

> - **Aérienne** : se propage dans l'air.
> - **Solidienne** : transmission dans les éléments solides ou structuraux
>   (plancher, mur, plafond, etc.).
> - **Réverbération** : le bruit rebondit selon le type de matériaux
>   (ex. : tôle vs panneau absorbant poreux).

**Illustration** (absente de la première transcription) : vue isométrique d'un
local souterrain. Une machine rouge (compresseur ou pompe, avec deux conduites
grises) repose sur un plancher ondulé rouge ; un travailleur stylisé se tient la
tête à deux mains ; des ondes rouges rebondissent sur le mur du fond. Trois
repères numérotés **①②③** placés dans la scène rattachent chaque mode de
propagation à un trajet physique — ① au niveau de la machine, ② dans l'air vers
le travailleur, ③ au sol.

C'est le seul support visuel de la diapo et il porte l'essentiel du message : les
trois modes sont simultanés. À recréer si la diapo devient un module.

## Diapo 11 — Système auditif : impact du bruit

Schéma de l'oreille (ondes sonores → canal auditif → tympan → cochlée → nerf
auditif → cortex auditif), avec comparaison **cellules ciliées saines** vs
**cellules ciliées endommagées** (rangées droites vs rangées couchées).

> ⚠️ L'annotation du cerveau sur l'image d'origine est **en anglais** :
> « Auditory cortex ». Toutes les autres étiquettes sont en français. Le schéma
> n'a donc pas été entièrement francisé — à refaire si l'illustration est
> reprise, la v1 du site excluant explicitement l'anglais.

> - Fatigue auditive
> - Acouphène
> - Surdité
>
> *(Lien vers une vidéo « destruction cellules ciliées » — média externe à
> retrouver ou à remplacer avant intégration dans l'app.)*

## Diapo 12 — Types de dommages auditifs et effets

> **Surdité brutale** : provoquée par un bruit soudain et intense comme une
> déflagration ou un coup de feu, elle peut causer des lésions immédiates et
> définitives de l'oreille interne et une déchirure du tympan.
>
> **Surdité progressive (FRÉQUENTE CHEZ LES FOREURS)** : résulte d'une exposition
> continue à des niveaux sonores élevés, détruisant les cellules ciliées de
> l'oreille interne et menant à une perte auditive **irréversible**.
>
> **Acouphènes** : sensation de bourdonnement, sifflement, ou d'autres bruits
> dans les oreilles, même en l'absence de source sonore extérieure.
>
> **Hyperacousie** : hypersensibilité anormale aux sons.
>
> **Symptômes d'alerte**
> - Sensation d'oreille bouchée
> - Douleur à l'oreille
> - Fatigue auditive
>
> **Effets sur la santé globale**
> - Stress et fatigue
> - Perturbation du sommeil
> - Des études ont lié l'exposition au bruit environnemental à un risque accru de
>   maladies cardiovasculaires, telles que l'hypertension artérielle.
> - Le bruit peut nuire à la capacité de se concentrer, ce qui affecte la qualité
>   du travail et la performance.

## Diapo 13 — Types de protection et Noise Reduction Rate (NRR)

> Titre : « Bouchons **70 % efficace**, coquilles **75 % efficace** »

| Protecteur (photo) | NRR |
|---|---|
| Howard Leight MAX (bouchon mousse) | 33 |
| 3M E-A-R TaperFit 2 (bouchon mousse) | 32 |
| Howard Leight Laser Lite (bouchon mousse) | 32 |
| Bouchons sur arceau (bleu) | 20 |
| Bouchons sur arceau (noir) | 17 |
| Coquilles serre-tête / coquilles sur casque MSA Sound Control SH | 25 |

## Diapo 14 — Double protection

> - La double protection auditive consiste à utiliser simultanément deux
>   dispositifs de protection : des bouchons d'oreille **et** des casques antibruit.
> - Recommandée dans les environnements où les niveaux de bruit dépassent
>   **105 dBA**, elle offre une meilleure réduction du bruit que l'utilisation d'un
>   seul dispositif. Cependant, la combinaison des deux ne signifie pas simplement
>   l'addition de leurs valeurs d'atténuation. En moyenne, la double protection
>   ajoute **5 dBA supplémentaires** au meilleur NRR des bouchons d'oreille, en
>   fonction des conditions et de la qualité de l'ajustement des dispositifs.
> - **Exemple** : bouchons d'oreille avec 60 % de 32 NRR : réduction de 19 dBA
>   + 5 dBA de réduction grâce au port de casques antibruit = **réduction de 24 dBA**
>
> *(Source : ODYO et CCHST)*

> ⚠️ **Incohérence à trancher** : la diapo 13 annonce une efficacité de **70 %**
> pour les bouchons, alors que l'exemple ci-dessus calcule avec **60 %**
> (32 × 0,60 = 19,2 dBA). Voir `docs/modele-de-calcul.md`.

## Diapo 15 — Qualité d'installation des protections

> **BOUCHONS**
> 1. Roulez le bouchon entre l'index et le pouce jusqu'à ce que le bouchon soit comprimé.
> 2. Tirez l'oreille vers le haut avec le bras opposé. Insérez le bouchon d'oreille
>    dans le canal auditif.
> 3. Attendez quelques secondes et laissez le bouchon se gonfler dans l'oreille.
>    Le bout du bouchon d'oreille ne doit pas être visible de face.
>
> **COQUILLES**
> - Serrage
> - État et propreté des coussins

## Diapo 16 — Temps d'utilisation vs efficacité

| Pourcentage d'utilisation | Temps d'utilisation | Atténuation |
|---|---|---|
| 100 % | 8 h 00 | 30 dB |
| 98 % | 7 h 50 | 17 dB |
| 95 % | 7 h 36 | 13 dB |
| 90 % | 7 h 12 | 10 dB |
| 50 % | 4 h 00 | 3 dB |

## Diapo 17 — Conclusion

> - Choisir le bon type de protection adapté à sa condition
> - Installation adéquate de la protection
> - **Porter la protection en tout temps**
