# Instachef

Carnet de recettes Angular : création et modification de recettes avec photos,
favoris, commentaires, profil, planning hebdomadaire et exports PDF et Word.

## Installation

Utiliser Node.js 24.15 ou plus récent dans la branche 24 LTS (ou une version
compatible indiquée dans `package.json`).

```bash
npm ci
npm start
```

Ouvrir `http://localhost:4200`.

## Commandes

- `npm run build` : compiler la version de production dans `dist/instachef/browser`.
- `npm run lint` : contrôler TypeScript et les modèles HTML.
- `npm test` : exécuter les tests de régression sans mode surveillance.
- `npm run check` : effectuer ces trois vérifications.
- `npm run deploy` : vérifier le build avec le chemin `/Instachef/`.

## Organisation

- `src/app/pages/` : interfaces de l’application, chargées à la demande.
- `src/app/components/` : en-tête et pied de page partagés.
- `src/app/core/services/` : session locale et accès protégé au stockage navigateur.
- `src/assets/` et `public/` : image par défaut et favicon nécessaires au build.
- `.github/workflows/` : vérifications des pull requests et déploiement Pages.
- `angular.json`, `tsconfig*.json`, `eslint.config.js` : configuration du projet.
- `package.json` et `package-lock.json` : dépendances et installation reproductible.

Les anciens fichiers compilés à la racine et dans `docs/`, copies numérotées,
sauvegardes `.bak` et `.eslint-backup`, configurations SSR inutilisées et anciennes
notes de correction ont été retirés. Leur historique reste accessible dans Git.
Il ne faut pas supprimer `src/`, les assets ou le fichier de verrouillage des
dépendances.

## Déploiement GitHub Pages

Chaque push sur `main` lance les contrôles puis la compilation avec
`--base-href /Instachef/`. GitHub Actions publie uniquement le dossier généré
`dist/instachef/browser` ; aucun build ne doit être ajouté au dépôt.
Le workflow ajoute un `404.html` identique à `index.html` pour permettre les liens
directs vers les routes Angular et leur rechargement.

Dans les paramètres GitHub Pages du dépôt, la source de publication doit être
**GitHub Actions**. La suppression des anciens builds ne convient pas à une
publication manuelle depuis la racine ou `docs/`.

## Données locales

Les recettes, favoris, commentaires, comptes et menus restent enregistrés dans le
navigateur, avec leurs clés existantes. Le nettoyage du dépôt ne les efface pas.
Effacer les données du navigateur les supprime ; elles ne sont pas synchronisées
entre appareils.

La connexion est une démonstration locale : les mots de passe sont hachés en
SHA-256, sans serveur d’authentification. Elle nécessite HTTPS ou localhost ;
aucun mot de passe n’est enregistré en clair si Web Crypto est indisponible.
Une authentification de production nécessite un serveur et une base de données.

Les tests couvrent le stockage refusé ou plein, les données invalides, les sessions
malformées et le changement de recette dans les commentaires. Les erreurs de
sauvegarde d’une recette ou d’un profil sont désormais affichées dans l’interface.
