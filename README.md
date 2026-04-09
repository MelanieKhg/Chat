# oChat - Multi-Conversation AI Assistant (v4.0)

oChat is a professional-grade web application designed for managing multiple AI-powered discussions. It features a reactive frontend built with **Svelte 5**, a relational backend powered by **PocketBase**, and advanced natural language processing via the **Mistral AI API**.

---

## 🌟 Key Features

- **Relational Chat Management**: Create and manage multiple conversation threads with full history persistence.
- **Mistral AI Integration**: Leverages the `mistral-small-latest` model for high-quality, context-aware responses.
- **Modern Reactive UI**: Built with Svelte 5 Runes ($state, $effect) for seamless data synchronization.
- **Responsive Design**: A fully adaptive interface featuring a slide-in sidebar and mobile-optimized layouts.
- **Secure Architecture**: Local storage for API tokens and robust error handling for all network operations.
- **Markdown Rendering**: Support for rich text, code blocks, and formatted lists in AI responses.

---

## 🛠️ Technical Stack

- **Frontend**: Svelte 5 (Vite), JavaScript (ES6+), CSS3.
- **Backend**: PocketBase (Relational SQLite-based server).
- **AI Engine**: Mistral AI API.
- **Libraries**: `svelte-exmarkdown` for content rendering.
- **Version Control**: Git (Iterative development from v1 to v4).

---

## ⚙️ Installation & Setup

### 1. Backend (PocketBase)
1. Navigate to the `./pb` directory.
2. Launch the PocketBase executable:
   ```bash
   npm run pb:serve

   Open the Admin UI (http://localhost:8090/_/), create an admin account.

Go to Settings > Import collections and select ./pb/pb_schema.json to initialize the database structure (Conversations & Messages tables).

2. Frontend
Install project dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
Open http://localhost:5173 in your browser.

Input your Mistral API Token when prompted to enable AI features.

📂 Project Architecture
Plaintext
SA07_ochat/
├── src/
│   ├── App.svelte      # Main application logic & State management
│   ├── main.js         # Entry point (Svelte 5 mount)
│   ├── app.css         # Global styles & UI variables
│   └── md.css          # Markdown specific styling
├── pb/
│   └── pb_schema.json  # Relational DB Schema
├── index.html          # SPA Root
└── package.json        # Dependencies & Scripts
🛡️ Development Standards & Security
Defensive Programming: All API calls are wrapped in try...catch blocks with user-friendly error feedback.

Data Integrity: Uses relational foreign keys to ensure messages are correctly mapped to their respective conversations.

Clean Code: Follows modern Svelte 5 patterns (Runes) and modular CSS variables for maintainability.

Accessibility (A11y): Includes responsive breakpoints, high-contrast focus states, and reduced-motion support.

📜 License
This project was developed as part of the AT 1 (Develop a Secure Application) certification.


### Pourquoi ce README est efficace pour ton diplôme :

* **Validation de la compétence "Anglais"** : Le vocabulaire est précis (*Foreign keys*, *State management*, *Wrappped in try...catch*).
* **Preuve de sécurité** : La section "Security" montre que tu as réfléchi aux risques et aux erreurs.
* **Documentation technique** : La structure des dossiers et les instructions de setup montrent que tu sais travailler de manière organisée.

**Tu peux maintenant copier-coller ce contenu dans ton fichier `README.md` !**