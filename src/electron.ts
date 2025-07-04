import path from "node:path";
import { BrowserWindow, app, ipcMain } from "electron"
import ollama_api, { system_ollama_api } from "./API/ollama/ollama_api";
import { addToHistory } from "./API/api_controller";


/**
 * @summary Creates and configures the main application window.
 * @description This function initializes a new `BrowserWindow`, sets its theme and
 * web preferences, and loads the main `index.html` file. The `preload` script
 * is crucial for securely exposing Node.js functionality (like IPC) to the
 * renderer process.
 */
function createWindow() {
  const win = new BrowserWindow({
    darkTheme: true,
    webPreferences: {
      // Preload is the correct way to do this.
      // This script runs in a privileged context before the renderer's web content loads.
      preload: path.join(app.getAppPath(), "/electron/js/preload.js"),
    }
  });
  // Load the main HTML file that constitutes the application's UI.
  win.loadFile(path.resolve("./electron/index.html"));
}

/**
 * @summary The main entry point and setup function for the Electron application.
 * @description This function orchestrates the entire Electron app lifecycle. It sets
 * up listeners for key events like 'ready' and 'window-all-closed', and it defines
 * all the IPC channels that allow the renderer process (the UI) to communicate
 * with this main process to access the AI API and environment variables.
 */
export default function handleElectron() {
  console.log("Starting Electron...");

  // --- Application Lifecycle Events ---

  // This event fires when Electron has finished initialization.
  app.on("ready", () => {
    createWindow();
    // macOS-specific: Re-create a window if the app is activated and no windows are open.
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length == 0) {
        createWindow();
      }
    })
  });

  app.on('window-all-closed', () => {
    // On Windows and Linux ('win32', 'linux'), closing all windows quits the app.
    // On macOS ('darwin'), apps typically stay active in the dock. This implements that standard behavior.
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });


  // --- IPC (Inter-Process Communication) Handlers ---
  // These handlers allow the renderer process (UI) to invoke functions in this main process.

  //TODO Implement this in the main application
  //! As of now this is unused
  /**
   * An IPC handler designed to provide a short, welcoming introduction from the AI.
   * Currently not used in the application.
   */
  ipcMain.handle("introduction", async () => {
    return await system_ollama_api("Welcome the user in 10 words or less.");
  });

  /**
 * The primary IPC handler for chat functionality.
 * @param {IpcMainInvokeEvent} event - The event object.
 * @param {string} text - The user's message text from the UI.
 * @returns {Promise<string>} The AI's response.
 */
  ipcMain.handle("chat", async (event, text: string) => {
    console.log(text);

    //TODO: Remove this entirely. Handle history differently between users and chats.
    // Currently adds the message to a shared, global history.
    addToHistory({
      role: "user",
      content: text
    });

    // Calls the stateful Ollama API and returns the response to the UI.
    return await ollama_api(0);
  });

  /**
   * An IPC handler to securely provide the Gravatar email from environment variables
   * to the renderer process, for displaying a profile picture.
   */
  ipcMain.handle("getGravatarEmail", () => {
    return process.env.GRAVATAR_EMAIL;
  });

  /**
 * An IPC handler to provide the user's name from environment variables to the UI.
 */
  ipcMain.handle("getUsername", () => {
    return process.env.USER_NAME;
  });

  /**
   * An IPC handler to provide the bot's name from environment variables to the UI,
   * for display in the sidebar or title.
   */
  ipcMain.handle("getBotName", () => {
    return process.env.BOT_NAME;
  });
};
