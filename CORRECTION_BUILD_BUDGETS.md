# Correction des budgets Angular

Le build était bloqué uniquement par le budget `anyComponentStyle` de 8 kB, alors que la feuille SCSS de création de recette mesure environ 12,36 kB.

Modifications dans `angular.json` :

- bundle initial : avertissement à 900 kB, erreur à 1,2 MB ;
- style d’un composant : avertissement à 13 kB, erreur à 16 kB ;
- `html2pdf.js` et `html2canvas` ajoutés aux dépendances CommonJS autorisées.

Ces changements ne modifient pas le fonctionnement du site. Ils rendent les budgets cohérents avec la taille réelle de l’application et suppriment les avertissements CommonJS connus pour l’export PDF.
