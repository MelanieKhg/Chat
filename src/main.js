// Point d'entrée principal de l'application Svelte

// Importation de la fonction mount depuis Svelte 5
// Cette fonction permet de monter un composant dans le DOM
import { mount } from 'svelte'

// Importation du fichier CSS global
import './app.css'

// Importation du composant principal App
import App from './App.svelte'

// Montage du composant App dans l'élément HTML avec l'id 'app'
// Cette instruction crée l'application et l'affiche dans la page
const app = mount(App, {
  target: document.getElementById('app'), // Sélectionne l'élément <div id="app"> dans index.html
})

// Exportation de l'instance de l'application (optionnel)
export default app
