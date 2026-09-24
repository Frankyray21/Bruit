# Règles de travail sur ce dépôt

- **Chaque livraison est déployée.** Un push sur `main` ou sur une branche
  `claude/**` déclenche `.github/workflows/deploy.yml` (tests, build,
  publication sur `gh-pages`). Après avoir poussé : vérifier que le workflow
  est vert et que le site répond à **https://frankyray21.github.io/Bruit/**
  avec la nouvelle version, puis **partager ce lien** dans le message final.
- **Chaque livraison monte la version** dans `package.json` (et le lock) :
  correctif → patch, nouveauté → mineure. Le numéro apparaît dans l'app
  (« Version 0.2.0 · date du build », onglet Moi › Réglages du formateur, et
  pied de la sidebar).
- Avant de pousser : `npm run build` (typecheck + build) et `npm test`.
- Le contenu pédagogique reste traçable aux diapos de la formation (voir
  `docs/formation-source.md`) ; les formules du moteur (`src/domain`) ne se
  changent pas sans leurs tests. Tout est en français, tutoiement, hors-ligne,
  aucune donnée envoyée nulle part.
