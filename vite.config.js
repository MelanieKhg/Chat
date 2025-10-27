// Configuration de Vite - l'outil de build et de développement

// Importation de la fonction de configuration de Vite
import { defineConfig } from 'vite'

// Importation du plugin Svelte pour Vite
// Ce plugin permet à Vite de comprendre et compiler les fichiers .svelte
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Documentation officielle de Vite
// https://vite.dev/config/

// Configuration de Vite pour le projet
export default defineConfig({
  // Liste des plugins à utiliser
  plugins: [
    svelte() // Active le support de Svelte dans Vite
  ],
})
