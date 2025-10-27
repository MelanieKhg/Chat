<!-- 
  Fichier principal de l'application Svelte
  Ce fichier contient l'interface de chat complète
-->

<!-- Structure HTML de l'application -->
<div class="container">
  <!-- Conteneur principal qui occupe toute la hauteur de l'écran -->
  
  <div class="content">
    <!-- Zone de contenu flexible -->
    
    <div class="chat-container">
      <!-- Conteneur spécifique au chat -->
      
      <div class="messages">
        <!-- Zone d'affichage des messages -->
        
        <!-- Message d'un utilisateur -->
        <div class="user">
          <div class="markdown-body">
            <p>hello</p>
          </div>
          <div class="timestamp">09:59</div>
        </div>
        
        <!-- Message de l'assistant -->
        <div class="assistant">
          <div class="markdown-body">
            <p>
              Bonjour, je suis un assistant virtuel. Comment puis-je vous aider
              ?
            </p>
          </div>
          <div class="timestamp">10:00</div>
        </div>
      </div>

      <!-- Zone de saisie pour écrire de nouveaux messages -->
      <div class="input-area">
        <textarea
          placeholder="Tapez votre message..."
          rows="1"
          autocomplete="off"
        ></textarea>

        <button>Envoyer</button>
      </div>
    </div>
  </div>
</div>

<style>
  /* Styles CSS pour l'interface */
  
  /* Conteneur principal - occupe toute la hauteur de l'écran */
  .container {
    display: flex;
    flex-direction: column; /* Disposition verticale */
    height: 100vh; /* 100% de la hauteur de la fenêtre */
  }

  /* Zone de contenu flexible */
  .content {
    display: flex;
    flex: 1; /* Prend tout l'espace disponible */
  }

  /* Conteneur du chat */
  .chat-container {
    flex: 1; /* Prend tout l'espace disponible */
    display: flex;
    flex-direction: column; /* Messages en haut, saisie en bas */
    padding: 1rem; /* Espacement intérieur */
    background: #f5f5f5; /* Couleur de fond gris clair */
  }

  /* Zone des messages */
  .messages {
    flex: 1; /* Prend tout l'espace disponible */
    overflow-y: auto; /* Défilement vertical si nécessaire */
    padding: 1rem; /* Espacement intérieur */
    display: flex;
    flex-direction: column; /* Messages empilés verticalement */
    gap: 1rem; /* Espacement entre les messages */
  }

  /* Style des messages utilisateur - alignés à droite */
  .user {
    align-self: flex-end; /* Alignement à droite */
    background: white; /* Fond blanc */
    color: black; /* Texte noir */
  }

  /* Style des messages assistant - alignés à gauche */
  .assistant {
    align-self: flex-start; /* Alignement à gauche */
    background: #e9ecef; /* Fond gris */
    color: #212529; /* Texte gris foncé */
  }

  /* Style commun pour tous les messages */
  .messages > div {
    max-width: 70%; /* Largeur maximale des bulles */
    padding: 1rem; /* Espacement intérieur */
    border-radius: 1rem; /* Coins arrondis */
    animation: fadeIn 0.3s ease; /* Animation d'apparition */
  }

  /* Style des horodatages */
  .timestamp {
    font-size: 0.75rem; /* Taille de police plus petite */
    opacity: 0.7; /* Transparence pour effet discret */
    margin-top: 0.5rem; /* Espacement au-dessus */
  }

  /* Zone de saisie en bas */
  .input-area {
    padding: 1rem; /* Espacement intérieur */
    background: white; /* Fond blanc */
    border-radius: 1rem; /* Coins arrondis */
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05); /* Ombre subtile */
    display: flex; /* Disposition en ligne */
    gap: 1rem; /* Espacement entre les éléments */
    align-items: center; /* Alignement vertical centré */
  }

  /* Style du champ de saisie */
  textarea {
    flex: 1; /* Prend tout l'espace disponible */
    padding: 0.75rem; /* Espacement intérieur */
    border: 1px solid #dee2e6; /* Bordure grise */
    border-radius: 0.5rem; /* Coins arrondis */
    resize: none; /* Empêche le redimensionnement */
    font-family: inherit; /* Hérite de la police parent */
  }

  /* Style du bouton d'envoi */
  button {
    padding: 0.75rem 1.5rem; /* Espacement intérieur */
    background: #007bff; /* Fond bleu */
    color: white; /* Texte blanc */
    border: none; /* Pas de bordure */
    border-radius: 0.5rem; /* Coins arrondis */
    cursor: pointer; /* Curseur de sélection */
    transition: opacity 0.2s; /* Transition douce pour l'opacité */
  }

  /* Style du bouton désactivé */
  button:disabled {
    opacity: 0.6; /* Transparence pour indiquer l'état désactivé */
    cursor: not-allowed; /* Curseur d'interdiction */
  }

  /* Animation de rotation (pour les indicateurs de chargement) */
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Animation d'apparition en fondu */
  @keyframes fadeIn {
    from {
      opacity: 0; /* Commence invisible */
      transform: translateY(10px); /* Légèrement décalé vers le bas */
    }
    to {
      opacity: 1; /* Finit visible */
      transform: translateY(0); /* Position finale */
    }
  }
</style>
