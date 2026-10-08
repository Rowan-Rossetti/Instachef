# Instachef — refonte approfondie

## Ce qui a été repris

- identité visuelle cohérente sur les pages principales ;
- page de création, consultation et modification responsive ;
- formulaire enrichi avec durée, difficulté, progression et aperçu en direct ;
- validation des champs et des images (JPG/PNG/WEBP, 3 Mo maximum) ;
- authentification centralisée dans `AuthService` ;
- routes privées protégées et route d’authentification inaccessible en session active ;
- session temporaire ou persistante selon « Se souvenir de moi » ;
- mot de passe enregistré sous forme d’empreinte SHA-256 pour cette démonstration locale ;
- accès au stockage navigateur centralisé et protégé pour le rendu serveur ;
- profil modernisé, responsive et relié au nouveau service d’authentification ;
- suppression des copies de fichiers, anciens builds et fichiers temporaires.

## Lancer le projet

```bash
npm install
npm start
```

Puis ouvrir `http://localhost:4200`.

## Vérifications recommandées

```bash
npm run build
npm run lint
npm audit
```

Ne lancez pas `npm audit fix --force` sans examiner les changements majeurs proposés.

## Limite importante

Cette application reste une démonstration front-end utilisant le stockage du navigateur. Une vraie mise en production nécessite une API, une base de données, une authentification serveur, des cookies sécurisés et un traitement d’images côté serveur.

## Refonte responsive globale — juillet 2026

Cette passe concerne toutes les interfaces sauf la page de création, consultation et modification des recettes.

### Pages retravaillées
- En-tête : navigation à icônes, état actif, barre compacte tactile sur mobile.
- Pied de page : disposition adaptative et navigation secondaire.
- Accueil : hero réorganisé, résumé du carnet, filtres encadrés, cartes flexibles et état vide horizontal/vertical.
- Favoris : cartes horizontales sur grand écran, verticales sur mobile et nouvel état vide.
- Planning : en-tête de page, aide contextuelle, cartes journalières et champs empilés aux largeurs intermédiaires.
- Profil : mise en page à deux colonnes avec panneau d’information, puis empilement tablette/mobile.
- Connexion/inscription : proportions revues, avantages en grille tablette, formulaire compact mobile.
- Commentaires : liste structurée, compteur, avatars, actions et formulaire responsive.

### Paliers principaux
- Grand écran : grilles riches et colonnes latérales.
- Tablette : réduction progressive des colonnes et conservation des actions importantes.
- Mobile : navigation tactile, contenus empilés, boutons pleine largeur lorsque pertinent.

La page `create-recipe` n’a pas été modifiée pendant cette passe.

## Ajustements de la fiche recette et du planificateur

- La consultation d’une recette utilise désormais une fiche de lecture sans champs de formulaire.
- La photo principale est agrandie et les informations sont présentées sous forme de liste.
- La progression et le bouton d’annulation ne sont pas affichés en consultation.
- Les commentaires ont une disposition plus claire et plus responsive.
- Les cartes de favoris ouvrent la recette au clic.
- Le planificateur enregistre automatiquement les choix et propose l’impression, le PDF et un document Word.
- Aucun emoji n’a été ajouté au code ; les pictogrammes utilisent Angular Material Icons.

## Saisie libre dans le planificateur

Les champs Entrée, Plat et Dessert acceptent désormais deux usages : choisir une recette enregistrée parmi les suggestions, ou saisir librement le nom d'une recette personnelle. Les valeurs libres sont sauvegardées, imprimées et incluses dans les exports Word et PDF comme les recettes enregistrées.

## Centrage responsive global

- Les titres, introductions, résumés, cartes, états vides et groupes d’actions sont centrés sur les écrans de 768 px ou moins lorsque cela améliore la lisibilité.
- Les champs de saisie et les longs textes restent alignés à gauche pour conserver une lecture et une saisie naturelles.
- Les boutons du planificateur sont centrés à toutes les tailles d’écran.
