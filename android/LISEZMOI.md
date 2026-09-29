# Application Android (APK)

Une **Trusted Web Activity** : l'APK n'embarque aucun contenu, il ouvre le site
publié (https://frankyray21.github.io/Bruit/) dans Chrome, plein écran, avec
l'icône « Bruit » sur l'écran d'accueil. Le hors-ligne est celui du site (service
worker) : **la première ouverture demande le réseau**, ensuite tout est là,
comme pour l'application installée depuis le navigateur (PWA).

L'APK est **construit par la CI** (`.github/workflows/deploy.yml`, job `apk`)
à chaque déploiement, puis publié avec le site :

- `https://frankyray21.github.io/Bruit/telecharger/bruit.apk` — le fichier ;
- `https://frankyray21.github.io/Bruit/telecharger/bruit.json` — version,
  date, empreinte SHA-256 et type de signature ;
- `https://frankyray21.github.io/Bruit/.well-known/assetlinks.json` — la
  déclaration d'association (voir ci-dessous).

La page de téléchargement est **discrète** : onglet Moi › Réglages du formateur
› « Version Android (APK) ». L'installation depuis le navigateur (PWA) reste la
voie mise de l'avant.

## Signature

Sans secret configuré, la CI signe avec une **clé temporaire** régénérée à
chaque construction : l'APK s'installe, mais une nouvelle version ne peut pas
remplacer l'ancienne (il faut désinstaller d'abord). Pour une signature stable,
créer une clé une fois et la mettre dans les secrets du dépôt :

```sh
keytool -genkeypair -v -keystore bruit.keystore -alias bruit \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 bruit.keystore   # → secret ANDROID_KEYSTORE_B64
```

Secrets : `ANDROID_KEYSTORE_B64`, `ANDROID_KEYSTORE_PASSWORD`,
`ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Garder le fichier `.keystore` en
lieu sûr : perdu, plus aucune mise à jour n'est possible sans désinstaller.

## Barre d'adresse (Digital Asset Links)

Chrome n'enlève sa barre d'adresse que si le **domaine** déclare l'application :
`https://frankyray21.github.io/.well-known/assetlinks.json` — à la racine du
domaine, pas sous `/Bruit/`. Ce dépôt produit le fichier (`dist/.well-known/`),
mais GitHub Pages le sert sous `/Bruit/`. Pour qu'il compte, **copier
`assetlinks.json` dans le dépôt du site racine** (`frankyray21.github.io`),
dossier `.well-known/`. Sans cela, l'application fonctionne, avec une fine
barre Chrome en haut.

## Construire localement

Nécessite le SDK Android et Java 17 : `cd android && gradle assembleRelease`
(variables `BRUIT_KEYSTORE`, `BRUIT_KEYSTORE_PASSWORD`, `BRUIT_KEY_ALIAS`,
`BRUIT_KEY_PASSWORD`, sinon `bruit.keystore` à côté avec le mot de passe
`bruit-temporaire`).
