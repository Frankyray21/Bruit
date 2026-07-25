# Bruit — Protection auditive en milieu minier

Application web (PWA) de sensibilisation et de calcul d'exposition au bruit,
construite à partir de la formation **« Informations protection auditive 2025 »**
donnée aux travailleurs de MRI.

## Objectif

Donner à un travailleur sur le terrain, en moins d'une minute et sans réseau,
une réponse à trois questions :

1. **Combien de temps** puis-je rester exposé à ce niveau de bruit aujourd'hui ?
2. **Quelle protection** dois-je porter pour être sous la norme ?
3. **Qu'est-ce que je risque** si je l'enlève « juste 20 minutes » ?

## Deux piliers

| Pilier | Contenu |
|---|---|
| **Calculateur d'exposition** | Métier ou tâche → dose de bruit, durée maximale permise (RSST art. 137), protection requise, effet de la double protection et du temps de port réel |
| **Formation interactive + quiz** | Les 17 diapos transformées en modules courts, avec quiz de validation et attestation de réussite |

## Public visé

Travailleurs de terrain : mineurs, foreurs, câbleurs, mécaniciens, soudeurs,
électriciens. Interface en français, gros contrôles utilisables avec des gants,
fonctionnement **hors-ligne** (réseau inexistant sous terre).

## Le site

**https://frankyray21.github.io/Bruit/**

Installable sur téléphone depuis le menu du navigateur (« Ajouter à l'écran
d'accueil »), et fonctionnel **sans réseau** une fois installé.

Le workflow `.github/workflows/deploy.yml` rejoue les tests, construit le site et
publie le résultat sur la branche `gh-pages` à chaque poussée.

> **Une manipulation est requise une seule fois**, dans
> **Réglages → Pages → Build and deployment** : choisir la source
> **« Deploy from a branch »**, puis la branche **`gh-pages`** et le dossier
> **`/ (root)`**.
>
> Cette étape ne peut pas être automatisée : le jeton dont dispose GitHub
> Actions n'a pas le droit de créer un site Pages (`Resource not accessible by
> integration`). Seul le propriétaire du dépôt peut le faire.

## État du projet

Site fonctionnel : 6 modules de formation, une boîte à outils, un quiz de
14 questions avec attestation, un mode présentation pour le formateur. Le moteur
de calcul est couvert par 76 tests qui reproduisent chaque ligne des tableaux de
la formation.

```bash
npm install
npm run dev      # développement
npm test         # 76 tests du moteur de calcul
npm run build    # typecheck + build de production
```

Voir **[PLAN.md](PLAN.md)** pour le plan par phases et
**[docs/catalogue-outils.md](docs/catalogue-outils.md)** pour l'inventaire des
29 outils interactifs et la sélection retenue pour la v1.

## Structure du dépôt

```
PLAN.md                       Plan de réalisation par phases
docs/formation-source.md      Contenu intégral de la formation, diapo par diapo
docs/modele-de-calcul.md      Les 8 formules, leur validation et leurs limites
docs/catalogue-outils.md      Les 29 outils interactifs, priorisés
data/rsst-art137.json         Table réglementaire des durées permises
data/metiers.json             Niveaux mesurés par métier et par tâche
data/protecteurs.json         Protecteurs auditifs et leur NRR
data/statistiques-cnesst.json Données de surdité professionnelle au Québec
src/domain/                   Moteur de calcul, pur et sans dépendance UI
src/domain/__tests__/         Un test par ligne des diapos 6, 14 et 16
```

Le moteur `src/domain/` est **vérifiable sans démarrer le site**. C'est
volontaire : les formules sont la valeur réelle du projet et le formateur doit
pouvoir les auditer ligne par ligne contre sa formation.

## Avertissement

Cette application produit des **estimations pédagogiques** à partir de mesures
antérieures. Elle ne remplace ni une dosimétrie individuelle, ni l'évaluation
d'un hygiéniste du travail, ni le programme de conservation de l'ouïe de
l'employeur. Voir la section « Limites » de `docs/modele-de-calcul.md`.
