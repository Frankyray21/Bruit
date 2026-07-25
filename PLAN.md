# Plan de réalisation — application « Bruit »

## 1. Décisions de départ

| Décision | Choix | Raison |
|---|---|---|
| Plateforme | **PWA installable** (React + Vite + TypeScript) | Un seul code, installable sur le téléphone depuis un lien, fonctionne hors-ligne sous terre, aucun compte de développeur ni passage par les stores. Déployable gratuitement. |
| Périmètre v1 | **Calculateur d'exposition** + **formation interactive et quiz** | Les deux piliers demandés. |
| Public | **Travailleurs de terrain** | Dicte toute l'ergonomie : gros contrôles, français, aucun jargon, aucun compte à créer. |
| Stockage | **Local** (`localStorage` / IndexedDB) | Aucune donnée personnelle transmise. Évite entièrement la question du consentement et de l'hébergement. |

**Conséquence importante :** aucun serveur en v1. L'application est entièrement
statique. Cela retire la moitié de la complexité habituelle (authentification,
base de données, hébergement, RGPD/Loi 25) et permet de livrer vite. Un registre
centralisé côté SST reste possible plus tard (voir §8).

---

## 2. Ce que l'application fait — et ne fait pas

**Dans le périmètre v1**

- Estimer la dose de bruit d'un quart de travail, par métier ou en composant ses tâches
- Donner la durée maximale permise selon le RSST art. 137
- Recommander une protection (simple ou double) et calculer l'atténuation réelle
- Montrer l'effet du temps de port réel sur la protection effective
- Livrer la formation en modules courts avec un quiz de validation et une attestation

**Hors périmètre v1** (décisions à assumer explicitement)

- ❌ Mesure sonore par le micro du téléphone — un téléphone n'est pas un sonomètre
- ❌ Registre centralisé, comptes utilisateurs, tableau de bord superviseur
- ❌ Dépistage médical ou audiogramme
- ❌ Anglais ou autre langue (à prévoir dès l'architecture, à livrer plus tard)

---

## 3. Parcours travailleur

L'écran d'accueil pose une seule question : **« Qu'est-ce que tu fais aujourd'hui ? »**

```
ACCUEIL
├── « Mon quart » ──────────► Choisir métier OU composer ses tâches
│                             └─► RÉSULTAT : dose %, heure d'atteinte de la limite,
│                                            protection requise, verdict couleur
├── « Ma protection » ──────► Choisir son protecteur → atténuation réelle
│                             ├─► Curseur « temps de port » (l'écran clé)
│                             └─► Simulation double protection
├── « Comprendre » ─────────► 6 modules de formation (§5)
└── « Quiz » ───────────────► 10 questions → attestation
```

### L'écran décisif : le curseur de temps de port

C'est le message le plus fort de la formation et il ne passe pas dans un tableau.
Un curseur continu, de 100 % à 50 % de temps de port, avec le résultat qui
s'effondre en direct :

> Bouchons NRR 33, portés **100 %** du quart → **30 dB** de protection
> Retirés **10 minutes** sur 8 h (98 %) → **17 dB**
> Retirés **une demi-heure** (94 %) → **12 dB**

Dix minutes sans bouchons annulent presque la moitié de la protection de la
journée. C'est contre-intuitif, c'est vérifié par la formule, et c'est ce qui fait
changer un comportement.

### Verdict couleur

Chaque résultat se conclut par un verdict lisible en trois secondes, avec gants,
dans une lampe frontale :

| Dose | Couleur | Message |
|---|---|---|
| < 50 % | Vert | Sous la limite |
| 50–100 % | Jaune | Attention, dose élevée |
| > 100 % | Rouge | Limite dépassée — protection obligatoire |
| > 105 dBA | Rouge + | Double protection requise |

---

## 4. Architecture technique

```
src/
  domain/          Moteur de calcul pur — aucune dépendance UI
    rsst.ts            durée permise, dose, Lex,8h
    protection.ts      dérating NRR, double protection, temps de port
    verdict.ts         seuils et couleurs
    __tests__/         tests validés contre les tables de la formation
  data/            JSON de référence (importés depuis /data)
  features/
    calculateur/
    formation/
    quiz/
  ui/              Composants « terrain » : gros boutons, contrastes forts
  app/             Routage, coquille PWA, service worker
```

**Principe directeur : le moteur de calcul est un module pur et testé, séparé de
l'interface.** Les formules du §Modèle de calcul sont la valeur réelle du projet ;
elles doivent être vérifiables ligne par ligne contre la formation, sans démarrer
l'application.

**Choix techniques**

- React 19 + TypeScript + Vite
- `vite-plugin-pwa` (Workbox) pour le service worker et le manifeste
- Vitest pour les tests du domaine
- Aucune dépendance de composants lourde — l'interface est simple et sur mesure
- Déploiement : GitHub Pages via GitHub Actions

**Contraintes non négociables du terrain**

- Fonctionne à 100 % hors-ligne après la première visite
- Cibles tactiles ≥ 64 px (utilisation avec des gants)
- Contraste élevé, mode sombre par défaut (sous terre)
- Aucune saisie de texte libre dans le parcours principal — que des boutons
- Aucun compte, aucune connexion, aucune donnée envoyée nulle part

---

## 5. Modules de formation

Les 17 diapos réorganisées en 6 modules de 2 à 3 minutes, chacun terminé par une
question de validation.

| # | Module | Diapos source | Angle |
|---|---|---|---|
| 1 | Pourquoi ça compte | 2, 3 | Les cas explosent et touchent des travailleurs de plus en plus jeunes |
| 2 | Mesurer le bruit | 4, 5, 6, 10 | dB vs dBA, la règle des 3 dBA, la limite légale, la propagation |
| 3 | Mon métier, mon exposition | 7, 8, 9 | ⭐ Renvoie directement au calculateur |
| 4 | Ce que le bruit détruit | 11, 12 | Cellules ciliées, surdité progressive, acouphènes, symptômes d'alerte |
| 5 | Choisir sa protection | 13, 14 | NRR, dérating, double protection, « ça ne s'additionne pas » |
| 6 | La porter correctement | 15, 16, 17 | ⭐ Les 3 gestes du bouchon + le curseur de temps de port |

**Quiz** : 10 questions tirées d'une banque, dont au moins une par module.
Seuil de réussite 80 %. Attestation générée localement (nom saisi par le
travailleur, date, score) — exportable en PDF ou en image pour transmission au
comité SST.

> ⚠️ L'attestation est **déclarative**, générée sur l'appareil. Elle ne constitue
> pas un registre de formation opposable. Si la traçabilité formelle est requise
> par la CNESST, il faut un registre centralisé — voir §8.

---

## 6. Phases de réalisation

### Phase 0 — Fondations ✅ *(terminée)*

- [x] Extraction intégrale du contenu de la formation, incluant les 7 diapos en image
- [x] Reconstitution et validation des 4 formules contre les tables de la formation
- [x] Données de référence structurées en JSON (RSST, métiers, tâches, protecteurs, statistiques)
- [x] Relevé des incohérences de la source (voir §7)

### Phase 1 — Moteur de calcul

- [ ] `domain/rsst.ts` : durée permise, dose cumulée, Lex,8h
- [ ] `domain/protection.ts` : dérating, double protection, temps de port
- [ ] `domain/verdict.ts` : seuils et couleurs
- [ ] Tests unitaires reproduisant **chaque ligne** des tables des diapos 6, 14 et 16
- [ ] Configuration du facteur de dérating (défaut 60 %, ajustable)

*Livrable : un moteur testé, indépendant de toute interface.*

### Phase 2 — Coquille PWA

- [ ] Projet Vite + React + TypeScript
- [ ] Service worker, manifeste, installation sur écran d'accueil
- [ ] Vérification hors-ligne réelle (mode avion)
- [ ] Système de composants « terrain » : boutons ≥ 64 px, thème sombre, contrastes
- [ ] Déploiement continu sur GitHub Pages

*Livrable : une app installable et vide, mais déployée et testable sur téléphone.*

### Phase 3 — Calculateur

- [ ] Écran « Mon quart » : sélection par métier
- [ ] Composition de tâches multiples avec durées (dose cumulée)
- [ ] Écran « Ma protection » : sélection du protecteur, atténuation réelle
- [ ] **Curseur de temps de port** — l'écran signature
- [ ] Simulation de double protection avec l'avertissement « ça ne s'additionne pas »
- [ ] Écran de verdict avec code couleur

*Livrable : le premier pilier, utilisable sur le terrain.*

### Phase 4 — Formation et quiz

- [ ] 6 modules à partir de `docs/formation-source.md`
- [ ] Illustrations : schéma de l'oreille, cellules ciliées, gestes d'installation
- [ ] Banque de questions et moteur de quiz
- [ ] Attestation locale exportable
- [ ] Suivi de progression (modules complétés)

*Livrable : le second pilier. Application fonctionnellement complète.*

### Phase 5 — Validation terrain

- [ ] Relecture du contenu par le formateur et le comité SST
- [ ] Résolution des points ouverts du §7
- [ ] Test avec 3 à 5 travailleurs, avec gants, sous terre
- [ ] Ajustements d'ergonomie et de vocabulaire
- [ ] Textes d'avertissement légal validés

*Livrable : v1.0 diffusable.*

---

## 7. Points à valider avant la v1

Ces questions viennent de l'analyse du document source et bloquent la mise en
production, pas le développement.

1. **Facteur de dérating des bouchons — 70 % ou 60 % ?**
   La diapo 13 annonce 70 %, l'exemple chiffré de la diapo 14 utilise 60 %
   (32 × 0,60 = 19 dBA). Les deux sont incompatibles. Défaut provisoire : 60 %.
   → *À trancher avec le formateur.*

   **Ce n'est pas un détail cosmétique** : pour le mineur au jackleg en double
   protection, le facteur fait passer la durée permise de **2 h 28 (à 60 %) à
   5 h 17 (à 70 %)**. Le facteur doit donc être exposé dans l'interface de
   configuration, pas seulement dans un fichier.

2. ~~**Statistiques CNESST par année.**~~ **Déclassé — corroboré.**
   La somme des cas 1997-2010 relevés sur le graphique de la diapo 2 donne
   **36 122**, contre **36 188** annoncés à la diapo 3 (source textuelle
   indépendante) : **0,18 % d'écart**. Le relevé visuel est fiable. Reste une
   vérification de courtoisie auprès de l'INSPQ, plus un point bloquant.

   Subsiste en revanche une **exigence de formulation** : une part de la hausse
   est administrative et non épidémiologique. Écrire « les cas **reconnus** ont
   été multipliés par 9 » (facteur exact : ×8,90, et non ×8).

3. **Total des coûts.** 36 188 × 5 660 $ = 204 824 080 $, la diapo affiche
   204 813 300 $. Écart mineur, à corriger si le chiffre est repris.

3 bis. **Le « 30 dB » de la diapo 16 est orphelin.** Il ne correspond à aucun NRR
   de la diapo 13 ni à aucune valeur dératée. La diapo 16 raisonne en atténuation
   **nominale**, la diapo 14 en atténuation **dératée** — deux conventions dans la
   même formation. Quelle convention le site doit-il retenir ?
   → *Conséquence déjà appliquée : `A` est un paramètre d'entrée, jamais 30.*

3 ter. **Coquilles serre-tête ou sur casque ?** `data/protecteurs.json` listait un
   modèle serre-tête ; sur la diapo 13, les deux coquilles photographiées sont
   montées sur casque. L'entrée a été renommée `coquilles-casque`. Si un serre-tête
   est réellement distribué, il faut l'ajouter avec son propre NRR.

4. **Vidéo « destruction des cellules ciliées »** (diapo 11) : média externe non
   fourni. À retrouver, à obtenir sous licence, ou à remplacer par une animation
   ou une illustration libre de droits.

5. **Photos des protecteurs** (diapo 13) : ce sont des photos prises en atelier.
   Vérifier qu'elles peuvent être réutilisées, et si les modèles listés
   correspondent toujours à ce qui est distribué en 2025.

6. **Traçabilité de la formation.** L'attestation locale suffit-elle, ou le comité
   SST exige-t-il un registre centralisé ? Cette réponse détermine si un serveur
   devient nécessaire (§8).

7. **Actualité des dosimétries.** De quelle année datent les mesures des diapos 7
   à 9 ? Afficher la date dans l'app — une mesure de 2019 sur un équipement
   remplacé depuis induirait en erreur.

---

## 8. Après la v1 — pistes

Volontairement hors périmètre, mais l'architecture ne doit pas les empêcher.

- **Auto-évaluation des symptômes** (oreille bouchée, acouphènes, fatigue auditive)
  avec orientation vers l'infirmerie — jamais de diagnostic
- **Signalement d'un poste bruyant** au comité SST
- **Registre centralisé et vue superviseur** : formations complétées, mesures par
  secteur, conformité RSST. Nécessite un serveur, des comptes et une analyse
  Loi 25 sur les renseignements personnels
- **Comparateur sonore** : sons de référence pour situer 85, 95 et 115 dBA
- **Anglais**, et éventuellement d'autres langues selon la main-d'œuvre
- **Import des dosimétries** de la mine, pour tenir les données à jour sans
  toucher au code

---

## 9. Risques

| Risque | Portée | Atténuation |
|---|---|---|
| L'app est prise pour un outil de conformité légale | **Élevée** | Avertissement permanent, verbe « estimer » partout, jamais « mesurer » |
| Données de dosimétrie périmées | Moyenne | Afficher la date de mesure ; prévoir la mise à jour par fichier JSON |
| Incohérence 70 %/60 % non tranchée | Moyenne | Facteur configurable ; ne pas figer avant validation |
| Adoption faible sur le terrain | Élevée | Test réel avec gants sous terre en Phase 5 ; aucun compte à créer ; moins de 60 secondes pour obtenir une réponse |
| Dérive du périmètre vers l'outil SST complet | Moyenne | Périmètre v1 explicitement fermé au §2 |
