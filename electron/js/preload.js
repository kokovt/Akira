const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('akiraAPI', {
    getGravatarEmail: () => ipcRenderer.invoke("getGravatarEmail"),
    getUsername: () => ipcRenderer.invoke("getUsername"),
    getBotName: () => ipcRenderer.invoke("getBotName"),
    chat: (text) => ipcRenderer.invoke("chat", text)
});