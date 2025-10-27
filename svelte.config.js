// Configuration spécifique à Svelte

// Importation du préprocesseur Vite pour Svelte
// Ce préprocesseur permet d'utiliser des fonctionnalités modernes dans les fichiers .svelte
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

// Configuration de Svelte
export default {
  // Consultez la documentation officielle de Svelte pour plus d'informations
  // sur les préprocesseurs : https://svelte.dev/docs#compile-time-svelte-preprocess
  
  // Le préprocesseur traite le code avant compilation (CSS, JavaScript, etc.)
  preprocess: vitePreprocess(),
}
