# Kokochat / Akira

A versatile AI chat application powered by local language models via Ollama, accessible through both a dedicated Electron desktop app and an optional Discord bot.
![Electron image](/assets/electron.png)

---
## ✨ Features

* **Local AI**: All AI processing is done locally, using [ollama](https://ollama.com/), ensuring privacy and offline capability. No cloud dependencies or API keys needed for the core AI.
* **Dual Interfaces**:
    * **Electron Desktop App**: A clean, dedicated graphical interface for chattin directly with the AI.
    * **Discord Bot (Optional)**: Interact directly with the same AI by mentioning the bot in a discord server, or via DMS.
    ![Discord image](/assets/discord.png)

* **Customizable AI Personas**: Easily define and switch between different AI characters using simple JSON character cards
* **Stateful & stateless chat**: 
    * A spencial "owner" mode in the discord maintains a conversation history. 
        1. This doesn't persist between runs
        2. Planned to have (optional) individual member history.
    * All other interactions (standard users, reply chains, Electron App) use context-aware, stateless requests.
* **Discord Moderation tools**: Includes event handlers for logging deleted and edited messages to a designated channel.
* **Discord admin commands**: Manage server roles directly through the bot!
* **Soundboard**: Includes voice commands to make the bot join a voice channel and play a sound.

## ⌨️ Tech stack
* **Backend & Core login**: Typescript, Node.js
* **AI Integration**: [Ollama](https://ollama.com/)
* **Discord bot**: [discord.js](https://discord.js.org/)
* **Database**: Simple file-system based storage for user/guild settings.

## 🚀 Getting Started

### Prerequisites
Before you begin, make sure you have the following installed:
* **Node.js**: v18.x or later.
* **Ollama**: You must have Ollama installed locally and running. You can download it from [ollama.com](https://ollama.com)
* **An Ollama Model**: You need at least one model pulled. For example:
```bash
ollama pull nsheth/llama-3-lumimaid-8b-v0.1-iq-imatrix
```

### Installation & Setup
1. **Clone the repository**
```bash
git clone https://github.com/kokovt/Akira.git
cd Akira
```
2. **Install NPM packages**
```bash
npm install
```
3. **Configure your environment**:
Create a file named .env in the root of the project, and populate it with the necessary variables. You can use this example as a template.
```ini
# .env.example

# --- Core AI Configuration ---
# The name of the model you have pulled in Ollama (e.g., "llama3", "mistral")
AKIRA_OLLAMA_MODEL=llama3

# --- Electron App Configuration ---
# Your name, displayed in the Electron app's sidebar
USER_NAME=Onyx
# The email associated with your Gravatar account for the profile picture
GRAVATAR_EMAIL=user@example.com
# The name of the bot/character displayed in the Electron app
BOT_NAME=Akira

# --- Discord Bot Configuration (Optional) ---
# Set to "y" to enable the Discord bot, otherwise it will not run.
USE_DISCORD=y
# Your Discord bot's token from the Discord Developer Portal
BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
# Your personal Discord User ID. This enables the stateful chat history for you.
OWNER_ID=YOUR_DISCORD_ID_HERE
```

4. **Compile the typescript code**:
```bash
npm run build
```

## Running the Application:
Once setup is complete, you can start the application with:
```bash
npm run start
```
This will launch the Electron desktop application. If `USE_DISCORD` is set to `y`, the Discord bot will also log in and come online.

## 🔧 Configuration Details

The `.env` file is crucial for configuring the application:

- AKIRA_OLLAMA_MODEL: Required. Must match the name of a model you have installed in Ollama.
- USE_DISCORD: Controls whether the Discord bot component is activated. Set to y to enable. Any other value will disable it.
- BOT_TOKEN: Required if USE_DISCORD=y. Get this from the Discord Developer Portal.
- OWNER_ID: Required if USE_DISCORD=y. Your unique Discord user ID. This enables the special persistent chat history for your user.
- USER_NAME, GRAVATAR_EMAIL, BOT_NAME: These customize the appearance of the Electron application UI.

## Project structure
The project is organized into several key directories:
```txt
.
├── /characterCards/   # JSON files defining AI character personas.
├── /database/         # File-system database for user and guild settings.
├── /dist/             # Compiled JavaScript output from the TypeScript compiler.
├── /electron/         # Assets for the Electron UI (HTML, CSS, JS, images).
├── /src/              # All TypeScript source code.
│   ├── /API/          # Logic for interfacing with the Ollama API.
│   ├── /Discord/      # All Discord-specific code (commands, events).
│   ├── /database/     # The DATABASE class definition.
│   └── index.ts       # The main application entry point.
├── .env               # Your local environment configuration (you must create this).
└── package.json       # Project dependencies and scripts.
```

## Utility scripts:
### Discord Token Tester

A simple script is included to validate a Discord bot token without running the full application.

**Usage:**
```bash\
node discordtest.js --token=YOUR_DISCORD_BOT_TOKEN_HERE
```