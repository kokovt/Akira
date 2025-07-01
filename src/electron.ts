import { BrowserWindow, app } from "electron"
import path from "node:path";
import { ipcMain } from "electron";
import handleRecord from "./voice";
import ollama_api, { system_ollama_api } from "./API/ollama/ollama_api";
import { addToHistory } from "./API/api_controller";

function createWindow() {
  const win = new BrowserWindow({
    darkTheme: true,
    webPreferences: {
      preload: path.join(app.getAppPath(), "/electron/js/preload.js"),
    }
  });

  win.loadFile(path.resolve("./electron/index.html"));
}


export default function handleElectron() {
  console.log("Starting Electron...");

  app.on("ready", () => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length == 0) {
        createWindow();
      }
    })
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  ipcMain.handle("record-voice", async () => {
    return await handleRecord();
  });

  ipcMain.handle("introduction", async () => {
    return await system_ollama_api("Welcome the user in 10 words or less.");
  });

  ipcMain.handle("chat", async (event, text: string) => {
    console.log(text);
    addToHistory({
      role: "user",
      content: text
    });

    return await ollama_api(0);
  });

  ipcMain.handle("getGravatarEmail", () => {
    return process.env.GRAVATAR_EMAIL;
  });

  ipcMain.handle("getUsername", () => {
    return process.env.USER_NAME;
  });

  ipcMain.handle("getBotName", () => {
    return process.env.BOT_NAME;
  });
};
