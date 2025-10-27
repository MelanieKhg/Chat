# Interface de Chat - Projet Svelte

Ce projet est une application de chat simple construite avec **Svelte** et **Vite**. Elle présente une interface utilisateur moderne pour des conversations en temps réel.

## 🚀 Démarrage rapide

1. Dans un terminal, lancer `npm install && npm run dev`
2. Ouvrir votre navigateur à l'adresse `http://localhost:5173`

## 📁 Structure du projet

```
SA07_ochat/
├── src/
│   ├── App.svelte      # Composant principal avec l'interface de chat
│   ├── main.js         # Point d'entrée de l'application
│   └── app.css         # Styles CSS globaux
├── index.html          # Page HTML de base
├── vite.config.js      # Configuration de Vite (outil de build)
├── svelte.config.js    # Configuration de Svelte
├── package.json        # Dépendances et scripts du projet
└── README.md           # Ce fichier
```

## 🔧 Technologies utilisées

- **Svelte 5** : Framework JavaScript moderne et réactif
- **Vite** : Outil de build rapide et serveur de développement
- **CSS3** : Styles avec variables CSS et animations
- **JavaScript ES6+** : Syntaxe moderne JavaScript

## 📚 Explication des fichiers principaux

### `src/App.svelte`
- **Rôle** : Composant principal contenant toute l'interface utilisateur
- **Contenu** : 
  - Structure HTML de l'interface de chat
  - Styles CSS pour l'apparence
  - Zone de messages avec bulles de conversation
  - Zone de saisie avec textarea et bouton d'envoi

### `src/main.js`
- **Rôle** : Point d'entrée de l'application
- **Fonction** : Monte le composant `App.svelte` dans l'élément HTML avec l'id `app`

### `src/app.css`
- **Rôle** : Styles CSS globaux appliqués à toute l'application
- **Contenu** :
  - Variables CSS personnalisées (couleurs, polices)
  - Réinitialisation CSS pour une cohérence cross-browser
  - Styles pour l'accessibilité (focus, animations réduites)

### `index.html`
- **Rôle** : Page HTML de base qui sert de conteneur à l'application
- **Contenu** : Structure HTML minimale avec l'élément `<div id="app">` où Svelte monte l'application

### Fichiers de configuration
- `vite.config.js` : Configure Vite pour supporter Svelte
- `svelte.config.js` : Configure le préprocesseur Svelte
- `jsconfig.json` : Configuration JavaScript/TypeScript pour l'éditeur

## 🎨 Fonctionnalités de l'interface

- **Design responsive** : S'adapte aux différentes tailles d'écran
- **Bulles de conversation** : Messages utilisateur (droite) et assistant (gauche)
- **Animations fluides** : Transitions CSS pour une expérience utilisateur agréable
- **Accessibilité** : Support des préférences d'animation réduite
- **Styles modernes** : Coins arrondis, ombres subtiles, couleurs harmonieuses

## 🔄 Développement

### Commandes disponibles
```bash
npm install     # Installe les dépendances
npm run dev     # Lance le serveur de développement
npm run build   # Compile l'application pour la production
npm run preview # Prévisualise la version de production
```

### Ajout de fonctionnalités
Pour ajouter des fonctionnalités à cette application de chat :

1. **Logique JavaScript** : Ajoutez du code JavaScript dans `App.svelte` entre les balises `<script>`
2. **Nouveaux styles** : Modifiez les styles dans `App.svelte` ou `app.css`
3. **Nouveaux composants** : Créez de nouveaux fichiers `.svelte` dans le dossier `src/`

## 🌟 Concepts Svelte utilisés

- **Composants** : Structure modulaire avec `App.svelte`
- **Styles scoped** : CSS encapsulé dans les composants
- **Montage** : Utilisation de la fonction `mount()` pour afficher l'application
- **Réactivité** : Prêt pour l'ajout de variables réactives Svelte

---

Ce projet sert de base pour construire une application de chat plus complète avec des fonctionnalités comme l'envoi de messages, la gestion d'état, et la communication en temps réel.
