<script>
  import Markdown from "svelte-exmarkdown";
  import "./app.css";
  import "./md.css";
  import { onMount } from "svelte";

  // --- ÉTATS (RUNES SVELTE 5) ---
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

  // --- ÉTATS DÉRIVÉS ---
  let toggleButtonClass = $derived(showSidebar ? "toggle-sidebar sidebar-open" : "toggle-sidebar sidebar-closed");
  let sidebarClass = $derived(showSidebar ? "sidebar show" : "sidebar");
  let chatContainerClass = $derived(showSidebar ? "chat-container" : "chat-container full");
  let sendButtonDisabled = $derived(isLoading || pendingMessage.trim().length === 0);

  // --- INITIALISATION ---
  onMount(async () => {
    const savedToken = localStorage.getItem("mistralToken");
    if (savedToken) {
      mistralToken = savedToken;
      showTokenInput = false;
    }

    try {
      const response = await fetch("http://localhost:8090/api/collections/conversations/records");
      if (!response.ok) throw new Error("Erreur lors du chargement des conversations");
      
      const data = await response.json();
      conversations = data.items || [];
      
      if (conversations.length > 0) {
        selectedConversation = conversations[conversations.length - 1];
      }
    } catch (err) {
      console.error(err.message);
      error = "Impossible de connecter PocketBase";
    }
  });

  // --- LOGIQUE DES MESSAGES ---
  async function loadMessages(conversationId) {
    try {
      const response = await fetch(
        `http://localhost:8090/api/collections/messages/records?filter=(conversation='${conversationId}')&sort=created`
      );
      if (!response.ok) throw new Error("Erreur messages");
      
      const data = await response.json();
      messages = data.items.map(item => ({
        role: item.is_ai_response ? "assistant" : "user",
        content: item.content,
        timestamp: item.created,
      }));
    } catch (err) {
      console.warn(err.message);
      messages = [];
    }
  }

  // Réaction au changement de conversation
  $effect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    } else {
      messages = [];
    }
  });

  // --- ACTIONS ---
  async function sendMessage() {
    if (isLoading || !selectedConversation) return;

    const cleanMessage = pendingMessage.trim();
    if (!cleanMessage) return;

    isLoading = true;
    error = null;

    try {
      // 1. On envoie à PocketBase SANS l'ajouter à la main dans la liste "messages"
      const pbRes = await fetch("http://localhost:8090/api/collections/messages/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: cleanMessage,
          is_ai_response: false,
          conversation: selectedConversation.id,
        }),
      });

      if (!pbRes.ok) throw new Error("Erreur PocketBase");
      
      // On vide l'input
      pendingMessage = "";

      // 2. On force le rechargement des messages pour voir celui qu'on vient d'envoyer
      await loadMessages(selectedConversation.id);

      // 3. Appel Mistral
      const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mistralToken}`,
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!mistralRes.ok) {
        if (mistralRes.status === 401) throw new Error("Token invalide ou expiré");
        throw new Error("Erreur API Mistral");
      }

      const data = await mistralRes.json();
      const aiContent = data.choices[0].message.content;

      // 4. Sauvegarde Réponse IA
      await fetch("http://localhost:8090/api/collections/messages/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: aiContent,
          is_ai_response: true,
          conversation: selectedConversation.id,
        }),
      });

      // 5. On recharge une dernière fois pour voir la réponse de l'IA
      await loadMessages(selectedConversation.id);

    } catch (err) {
      error = err.message;
      // Si le token est mauvais, on permet de le rechager
      if (err.message.includes("Token")) {
        showTokenInput = true; 
      }
    } finally {
      isLoading = false;
    }
  }

  async function createConversation() {
    const title = newConversationTitle.trim();
    if (!title) return;

    try {
      const res = await fetch("http://localhost:8090/api/collections/conversations/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      
      if (!res.ok) throw new Error();
      const newConvo = await res.json();
      
      conversations = [...conversations, newConvo];
      selectedConversation = newConvo;
      newConversationTitle = "";
      showSidebar = false;
    } catch (err) {
      error = "Erreur lors de la création";
    }
  }

  async function deleteConversation(id) {
    try {
      const res = await fetch(`http://localhost:8090/api/collections/conversations/records/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error();
      
      conversations = conversations.filter(c => c.id !== id);
      if (selectedConversation?.id === id) {
        selectedConversation = conversations.length > 0 ? conversations[conversations.length - 1] : null;
      }
    } catch (err) {
      error = "Erreur de suppression";
    }
  }

  // --- UTILS ---
  function handleTokenSubmit() {
    const token = mistralToken.trim();
    if (token) {
      localStorage.setItem("mistralToken", token);
      showTokenInput = false;
    }
  }

  function formatTimestamp(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function handleKeyDown(e, callback) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      callback();
    }
  }
</script>

<div class="container">
  {#if showTokenInput}
    <div class="token-input">
      <input bind:value={mistralToken} placeholder="Token Mistral API" onkeydown={(e) => handleKeyDown(e, handleTokenSubmit)} />
      <button onclick={handleTokenSubmit}>Valider</button>
    </div>
  {:else}
    <div class="content">
      <button class={toggleButtonClass} onclick={() => showSidebar = !showSidebar}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/>
        </svg>
      </button>
      
      <div class={sidebarClass}>
        <div class="title"><h2>Conversations</h2></div>
        <ul>
          {#each conversations as convo}
            <li class:selected={selectedConversation?.id === convo.id}>
              <button class="convo-name" onclick={() => { selectedConversation = convo; showSidebar = false; }}>
                {convo.title}
              </button>
              <button class="delete-btn" onclick={() => deleteConversation(convo.id)}>×</button>
            </li>
          {/each}
        </ul>
        <div class="sidebar-footer">
          <input bind:value={newConversationTitle} placeholder="Nouveau chat..." onkeydown={(e) => handleKeyDown(e, createConversation)} />
          <button onclick={createConversation}>+</button>
        </div>
      </div>

      <div class={chatContainerClass}>
        <div class="messages">
          {#each messages as msg}
            <div class="message-wrapper {msg.role}">
              <div class="markdown-body">
                <Markdown md={msg.content} />
              </div>
              <span class="timestamp">{formatTimestamp(msg.timestamp)}</span>
            </div>
          {/each}
        </div>

        <div class="input-area">
          {#if error}<div class="error">{error}</div>{/if}
          <textarea 
            bind:value={pendingMessage} 
            placeholder="Votre message..." 
            onkeydown={(e) => handleKeyDown(e, sendMessage)}
            disabled={isLoading}
          ></textarea>
          <button onclick={sendMessage} disabled={sendButtonDisabled}>
            {isLoading ? "..." : "Envoyer"}
          </button>
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