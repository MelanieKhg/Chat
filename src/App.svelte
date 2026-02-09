<script>
  import Markdown from "svelte-exmarkdown";
  
  import "./app.css";
  
  import "./md.css";
  
  import { onMount } from "svelte";
  
  let conversations = $state([]);
  
  let selectedConversation = $state(null);
  
  let messages = $state([]);
  
  let pendingMessage = $state("");
  
  let isLoading = $state(false);
  
  let error = $state(null);
  
  let newConversationTitle = $state("");
  let mistralToken = $state("");
  
  let showTokenInput = $state(true); 

  let showSidebar = $state(false);
  
  let toggleButtonClass = $derived(showSidebar ? "toggle-sidebar sidebar-open" : "toggle-sidebar sidebar-closed");
  
  let sidebarClass = $derived(showSidebar ? "sidebar show" : "sidebar");
  
  let chatContainerClass = $derived(showSidebar ? "chat-container" : "chat-container full");

  function getSendButtonText() {
    if (isLoading) {
      return "Envoi...";
    } else {
      return "Envoyer";
    }
  }

  let sendButtonDisabled = $derived(
    isLoading === true || pendingMessage.replace(/^\s+|\s+$/g, '').length === 0
  );

  onMount(async () => {
    const savedToken = localStorage.getItem("mistralToken");
    if (savedToken !== null) {
      mistralToken = savedToken;
    }

    const response = await fetch(
      "http://localhost:8090/api/collections/conversations/records"
    );
    
    if (response.ok === false) {
      console.warn("Impossible de charger les conversations");
      conversations = [];
      return; 
    }
    
    const data = await response.json();
    
    if (data && data.items) {
      conversations = data.items;
      
      if (conversations.length > 0) {
        selectedConversation = conversations[conversations.length - 1];
      }
      
      console.log(`${conversations.length} conversations chargées`);
      
    } else {
      console.warn("⚠️ Aucune conversation reçue depuis PocketBase");
      conversations = [];
    }
  });

  async function loadMessages(conversationId) {
    const response = await fetch(
      `http://localhost:8090/api/collections/messages/records?filter=(conversation='${conversationId}')`
    );
    
    if (response.ok === false) {
      console.warn("Impossible de charger les messages");
      messages = [];
      return; 
    }
    
    const data = await response.json();
    
    if (data && data.items) {
      messages = convertPocketBaseToMessages(data.items);
      
      console.log(`${messages.length} messages chargés pour la conversation "${selectedConversation.title}"`);
      
    } else {
      console.warn("⚠️ Aucun message reçu depuis PocketBase");
      messages = [];
    }
  }

  $effect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    } else {
      messages = [];
    }
  });

  function createTimestamp() {
    return Date.now();
  }

  function formatTimestamp(timestamp) {
    const dateObject = new Date(timestamp);
    
    const hours = dateObject.getHours();
    const minutes = dateObject.getMinutes();
    
    let formattedHours = hours;
    if (hours < 10) {
      formattedHours = "0" + hours;
    }
    
    let formattedMinutes = minutes;
    if (minutes < 10) {
      formattedMinutes = "0" + minutes;
    }
    
    return formattedHours + ":" + formattedMinutes;
  }

  function handleTokenSubmit() {
    
    const cleanToken = mistralToken.replace(/^\s+|\s+$/g, '');
    
    if (cleanToken.length === 0) {
      console.warn("Token vide, impossible de continuer");
      return; 
    }
    
    localStorage.setItem("mistralToken", cleanToken);
    
    mistralToken = cleanToken;
    
    showTokenInput = false;
  }

  function convertMessagesForAPI(messagesList) {
    const convertedMessages = [];
    
    for (let i = 0; i < messagesList.length; i++) {
      const currentMessage = messagesList[i];
      
      const apiMessage = {
        role: currentMessage.role,      
        content: currentMessage.content 
      };
      
      convertedMessages.push(apiMessage);
    }
    
    return convertedMessages;
  }

  function convertPocketBaseToMessages(pocketbaseItems) {
    const convertedMessages = [];
    
    for (let i = 0; i < pocketbaseItems.length; i++) {
      const currentItem = pocketbaseItems[i];
      
      let messageRole;
      if (currentItem.is_ai_response) {
        messageRole = "assistant"; 
      } else {
        messageRole = "user"; 
      }
      
      const formattedMessage = {
        role: messageRole,
        content: currentItem.content,    
        timestamp: currentItem.created,  
      };
      
      convertedMessages.push(formattedMessage);
    }
    
    return convertedMessages;
  }

  function filterConversationsWithoutId(conversationsList, conversationIdToRemove) {
    const remainingConversations = [];
    
    for (let i = 0; i < conversationsList.length; i++) {
      const currentConversation = conversationsList[i];
      
      if (currentConversation.id !== conversationIdToRemove) {
        remainingConversations.push(currentConversation);
      }
    }
    
    return remainingConversations;
  }

  function toggleSidebar() {
    showSidebar = !showSidebar;
  }

  function selectConversation(conversation) {
    selectedConversation = conversation;
    
    showSidebar = false;
  }

  function handleTextareaKeyDown(event) {
    if (event.key === "Enter") {
      if (event.shiftKey === true) {
        return;
      }
      
      event.preventDefault();
      
      sendMessage();
    }
  }

  function handleTokenKeyDown(event) {
    if (event.key === "Enter") {
      handleTokenSubmit();
    }
  }

  async function createConversation() {
    const cleanTitle = newConversationTitle.replace(/^\s+|\s+$/g, '');
    
    if (cleanTitle.length === 0) {
      console.warn("Titre de conversation vide, impossible de créer");
      return;
    }
    
    const response = await fetch(
      "http://localhost:8090/api/collections/conversations/records",
      {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ 
          title: cleanTitle 
        }),
      }
    );
    
    if (response.ok === false) {
      console.error("❌ Erreur lors de la création de conversation: API error");
      error = "Impossible de créer la conversation";
      return; 
    }
    
    const data = await response.json();
    
    if (data && data.title) {
      conversations = conversations.concat(data);
      
      newConversationTitle = "";
      
      selectedConversation = data;
      
      showSidebar = false;
      
      console.log(`✅ Nouvelle conversation créée: "${data.title}"`);
      
    } else {
      console.error("❌ Réponse invalide lors de la création de conversation");
      error = "Impossible de créer la conversation";
    }
  }

  async function deleteConversation(conversationId) {
    const response = await fetch(
      `http://localhost:8090/api/collections/conversations/records/${conversationId}`,
      {
        method: "DELETE", 
      }
    );
    
    if (response.ok === false) {
      console.error("❌ Erreur lors de la suppression: API error");
      error = "Impossible de supprimer la conversation";
      return; 
    }
    
    conversations = filterConversationsWithoutId(conversations, conversationId);
    
    if (selectedConversation && selectedConversation.id === conversationId) {
      if (conversations.length > 0) {
        selectedConversation = conversations[conversations.length - 1];
      } else {
        selectedConversation = null;
      }
    }
    
    console.log(`✅ Conversation supprimée: ID ${conversationId}`);
  }

  async function sendMessage() {
    
    if (isLoading === true) {
      console.warn("Envoi déjà en cours, veuillez patienter");
      return; 
    }
    
    if (selectedConversation === null) {
      console.warn("Aucune conversation sélectionnée");
      return; 
    }
    
    const cleanMessage = pendingMessage.replace(/^\s+|\s+$/g, '');
    
    if (cleanMessage.length === 0) {
      console.warn("Message vide, impossible d'envoyer");
      return; 
    }

    const tempMessage = cleanMessage;

    isLoading = true;
    
    error = null;

    const userMessage = { 
      role: "user", 
      content: cleanMessage, 
      timestamp: createTimestamp() 
    };
    
    messages = messages.concat(userMessage);

    pendingMessage = "";

    const pocketbaseUserResponse = await fetch("http://localhost:8090/api/collections/messages/records", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        content: tempMessage, 
        is_ai_response: false, 
        conversation: selectedConversation.id, 
      }),
    });

    if (pocketbaseUserResponse.ok === false) {
      console.warn("Impossible de sauvegarder le message utilisateur dans PocketBase");
      error = "Erreur de sauvegarde du message utilisateur";
    }
    
    const response = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST", 
        headers: {
          "Content-Type": "application/json", 
          Accept: "application/json", 
          Authorization: `Bearer ${mistralToken}`, 
        },
        body: JSON.stringify({
          model: "mistral-small-latest", 
          messages: convertMessagesForAPI(messages),
        }),
      }
    );

    if (response.ok === false) {
      console.error("Erreur de l'API Mistral");
      error = "Problème avec l'API Mistral. Vérifiez votre token.";
      
      const errorUserMessage = { role: "user", content: tempMessage };
      messages = messages.concat(errorUserMessage);
      
      isLoading = false;
      return; 
    }

    
    const data = await response.json();
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      const assistantMessage = {
        role: "assistant",
        content: data.choices[0].message.content, 
        timestamp: createTimestamp(),
      };
      
      messages = messages.concat(assistantMessage);

      const pocketbaseAssistantResponse = await fetch("http://localhost:8090/api/collections/messages/records", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          content: assistantMessage.content, 
          is_ai_response: true, 
          conversation: selectedConversation.id, 
        }),
      });
      
      if (pocketbaseAssistantResponse.ok === false) {
        console.warn("Impossible de sauvegarder la réponse de l'assistant dans PocketBase");
        error = "Erreur de sauvegarde de la réponse";
      }
      
    } else {
      console.error("Réponse invalide de l'API");
      error = "Réponse invalide reçue de l'API";
      
      const errorUserMessage = { role: "user", content: tempMessage };
      messages = messages.concat(errorUserMessage);
    }
    
    isLoading = false;
  }

  function getMessageClass(message) {
    if (message.role === "user") {
      return "user";
    } else if (message.role === "assistant") {
      return "assistant";
    } else {
      return ""; // Par défaut, aucune classe
    }
  }
</script>




<div class="container">
  
  {#if showTokenInput}
    <div class="token-input">
      <input
        bind:value={mistralToken}
        placeholder="Entrez votre token Mistral"
        onkeydown={handleTokenKeyDown}
      />
      <button onclick={handleTokenSubmit}>Enregistrer</button>
    </div>
    
  {:else}
    <div class="content">
      
      <button
        class={toggleButtonClass}
        onclick={toggleSidebar}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <div class={sidebarClass}>
        
        <div class="title">
          <h2>Conversations</h2>
        </div>
        
        <ul>
          {#each conversations as conversation}
            
            <li
              role="button"
              tabindex="0"
              onclick={() => selectConversation(conversation)}
              class:selected={selectedConversation &&
                selectedConversation.id === conversation.id}
            >
              
              {conversation.title}
              
              <button onclick={() => deleteConversation(conversation.id)}>X</button>
            </li>
          {/each}
        </ul>
        
        <input
          bind:value={newConversationTitle}
          placeholder="Nouveau titre de conversation"
        />
        <button onclick={createConversation}>Créer</button>
      </div>

      <div class={chatContainerClass}>
        
        <div class="messages">
          {#each messages as message}
            <div class={getMessageClass(message)}>
              <div class="markdown-body">
                <Markdown md={message.content} />
              </div>
              
                  <div class="timestamp">
                    {formatTimestamp(message.timestamp)}
                  </div>
            </div>
          {/each}
        </div>

        <div class="input-area">
          
          {#if error}
            <div class="error">{error}</div>
          {/if}

          <textarea
            bind:value={pendingMessage}
            placeholder="Tapez votre message... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
            rows="1"
            autocomplete="off"
            disabled={isLoading}
            onkeydown={handleTextareaKeyDown}
          ></textarea>

          <button
            onclick={sendMessage}
            disabled={sendButtonDisabled}
          >
            {getSendButtonText()}
          </button>

          {#if isLoading}
            <div class="loader"></div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100vh; 
  }

  .token-input {
    display: flex;
    justify-content: center; 
    align-items: center; 
    height: 100vh; 
    background: #f5f5f5; 
  }

  .token-input input {
    padding: 0.5rem;
    border: 1px solid #dee2e6; 
    border-radius: 0.25rem; 
    margin-right: 0.5rem; 
  }

  .token-input button {
    padding: 0.5rem 1rem;
    background: #007bff; 
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }

    .content {
    display: flex;
    flex: 1; 
  }
  
  .toggle-sidebar {
    position: fixed; 
    top: 1rem; 
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    padding: 0.75rem;
    z-index: 1000; 
    background: #007bff; 
    transition: left 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3); 
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle-sidebar.sidebar-closed {
    left: 1rem; 
  }

  .toggle-sidebar.sidebar-open {
    left: 270px; 
  }

  .toggle-sidebar svg {
    width: 24px;
    height: 24px;
    color: white;
  }

    .d-none {
    display: none;
  }

  .d-inline {
    display: inline-block;
  }

  .sidebar {
    width: 250px; 
    background: #2c3e50; 
    color: white;
    padding: 1.5rem;
    display: flex;
    flex-direction: column; 
    gap: 1rem; 
    position: fixed; 
    top: 0;
    left: 0; 
    height: 100vh; 
    overflow-y: auto; 
    transform: translateX(-100%); 
    transition: transform 0.3s ease; 
    z-index: 500;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .sidebar .title {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid #34495e;
    margin-bottom: 1rem;
  }

  .sidebar h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #ecf0f1;
  }

  .sidebar ul {
    list-style: none; 
    padding: 0;
    margin: 0;
    flex: 1; 
    overflow-y: auto; 
    min-height: 200px; 
  }

  .sidebar li {
    padding: 0.75rem;
    cursor: pointer; 
    border-radius: 0.5rem;
    transition: all 0.2s ease; 
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid transparent;
  }

  .sidebar li:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(2px);
  }

  .sidebar li.selected {
    background: #3498db;
    border-color: #2980b9;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  }

  .sidebar li {
    font-size: 0.9rem;
    color: #ecf0f1;
  }

  .sidebar li button {
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: 0.5rem;
    transition: all 0.2s ease;
    padding: 0; 
    line-height: 1;
  }

  .sidebar li button:hover {
    background: #c0392b;
    transform: scale(1.1);
  }

  .sidebar input {
    padding: 0.75rem;
    border: 1px solid #34495e;
    border-radius: 0.5rem;
    color: #2c3e50;
    background: #ecf0f1;
    font-size: 0.9rem;
    width: 100%;
    margin-top: auto; 
  }

  .sidebar input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }

  .sidebar button:not(.toggle-sidebar):not(li button) {
    padding: 0.75rem;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    margin-top: 0.5rem;
  }

  .sidebar button:not(.toggle-sidebar):not(li button):hover {
    background: #219a52;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
  }

  .chat-container {
    flex: 1; 
    display: flex;
    flex-direction: column; 
    padding: 1rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
    margin-left: 0; 
    transition: margin-left 0.3s ease;
    min-height: 100vh;
  }

  .chat-container:not(.full) {
    margin-left: 250px;
  }

  .chat-container.full {
    margin-left: 0; 
  }

  .messages {
    flex: 1;
    overflow-y: auto; 
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .user {
    align-self: flex-end;
    background: white;
    color: black;
  }

  .assistant {
    align-self: flex-start;
    background: #e9ecef; 
    color: #212529;
  }

  .messages > div {
    max-width: 70%; 
    padding: 1rem;
    border-radius: 1rem; 
    animation: fadeIn 0.3s ease;
  }

  .timestamp {
    font-size: 0.75rem; 
    opacity: 0.7; 
    margin-top: 0.5rem;
  }

  .input-area {
    padding: 1rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05); 
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  textarea {
    flex: 1; 
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    resize: none; 
    font-family: inherit;
  }

  button {
    padding: 0.75rem 1.5rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: opacity 0.2s; 
  }

  button:disabled {
    opacity: 0.6; 
    cursor: not-allowed;
  }

  .error {
    color: #dc3545; 
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px); 
    }
    to {
      opacity: 1; 
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    
    .toggle-sidebar {
      display: flex;
    }

    .sidebar {
      width: 100vw; 
      height: 100vh; 
      z-index: 200; 
    }

    .sidebar.show {
      transform: translateX(0); 
    }

    .chat-container,
    .chat-container:not(.full) {
      margin-left: 0; 
    }

    .toggle-sidebar.sidebar-open {
      left: 1rem; 
    }
  }
</style>