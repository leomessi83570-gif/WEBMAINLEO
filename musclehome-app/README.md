# MuscleHome — MVP

App mobile de coaching musculation à domicile avec analyse photo (morphotype/posture)
générée par l'API Claude, programme et plan nutrition personnalisés.

## Structure

```
musclehome-app/
  mobile/    -> app Expo (React Native), à lancer avec l'app "Expo Go" sur ton téléphone
  backend/   -> serveur Node/Express qui appelle l'API Anthropic (Claude)
```

## 1. Lancer le backend

```bash
cd backend
npm install
cp .env.example .env
```

Ouvre `.env` et colle ta clé API Anthropic :
```
ANTHROPIC_API_KEY=sk-ant-...
```

Puis lance le serveur :
```bash
npm start
```

Tu dois voir : `MuscleHome backend démarré sur http://0.0.0.0:3000`

Vérifie qu'il répond : ouvre `http://localhost:3000/health` dans un navigateur → `{"ok":true}`.

## 2. Connecter l'app mobile au backend

Ton téléphone et ton ordinateur doivent être sur le **même réseau Wi-Fi**.

1. Trouve l'adresse IP locale de ton ordinateur :
   - Mac : `ipconfig getifaddr en0`
   - Windows : `ipconfig` (cherche "Adresse IPv4")
   - Linux : `hostname -I`
2. Ouvre `mobile/src/services/api.js` et remplace :
   ```js
   export const API_BASE_URL = 'http://192.168.1.23:3000';
   ```
   par ta vraie IP locale (garde le port `:3000`).

## 3. Lancer l'app mobile

```bash
cd mobile
npm install
npx expo start
```

Un QR code apparaît dans le terminal.

- **iOS** : ouvre l'app appareil photo, scanne le QR code, ça ouvre Expo Go (à installer
  depuis l'App Store si pas déjà fait)
- **Android** : installe l'app "Expo Go" depuis le Play Store, ouvre-la, scanne le QR code

L'app se lance sur ton téléphone en quelques secondes, sans compte développeur, sans compilation.

## Ce qui est déjà fonctionnel dans ce MVP

- Questionnaire complet (âge, objectif, niveau, matériel, blessures...)
- Capture de 2 photos (face/profil) envoyées à l'API Claude (vision) pour analyse
  morphologique et posturale
- Génération automatique d'un programme de musculation + plan nutrition adapté
- Déroulé de séance avec pointage des séries faites
- Historique des séances
- Écran nutrition (calories/macros + idées de repas)
- Paywall (simulé — voir plus bas)

## Ce qu'il reste à faire pour une vraie mise en production

1. **Paiement réel** : intégrer RevenueCat ou `react-native-iap`, connecté à App Store
   Connect et Google Play Console (nécessite les comptes développeur Apple 99$/an et
   Google 25$ une fois).
2. **Comptes utilisateurs + base de données** : actuellement tout est stocké en local sur
   le téléphone (AsyncStorage). Pour synchroniser entre appareils ou ne pas perdre les
   données à la désinstallation, il faudra une vraie base (Postgres/Supabase par ex.) et
   un système d'authentification.
3. **Déploiement du backend** : le lancer sur un service comme Railway ou Render au lieu
   de ton ordinateur, pour qu'il tourne 24/7.
4. **Bibliothèque d'exercices avec vidéos** : actuellement les exercices sont juste du
   texte généré par l'IA — ajouter des démonstrations vidéo/GIF améliorerait beaucoup
   l'expérience.
5. **Programme adaptatif automatique** : la route `/api/adjust-program` existe déjà côté
   backend mais n'est pas encore branchée sur un bouton dans l'app.
6. **Publication sur les stores** : une fois les comptes développeur créés, `eas build`
   (service gratuit d'Expo) permet de générer les fichiers `.ipa`/`.apk` sans avoir
   besoin de Mac pour iOS.

## Notes importantes

- L'analyse photo ne donne jamais de pourcentage précis de masse grasse (fourchettes
  larges seulement) — c'est volontaire, pour rester honnête sur la fiabilité réelle de
  ce type d'analyse.
- Les photos ne sont pas stockées ni par le backend ni par Anthropic au-delà du traitement
  de la requête — mais pense à écrire une vraie politique de confidentialité avant toute
  mise en ligne publique (données sensibles = RGPD strict).
