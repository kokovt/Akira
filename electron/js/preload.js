/**
 * @file Preload Script (Electron)
 * @summary Securely exposes main process functionality to the renderer process.
 * @description This script runs in a special, isolated context that has access to
 * both the renderer's `window` object and a limited set of Node.js APIs, including
 * Electron's `ipcRenderer`. It uses `contextBridge` to safely expose specific,
 * pre-defined functions to the renderer process (the UI). This is the recommended
 * security practice for Electron, as it avoids exposing the entire `ipcRenderer`
 * or other powerful APIs to potentially untrusted web content.
 */

const { contextBridge, ipcRenderer } = require("electron");

// The `contextBridge.exposeInMainWorld` function is used to create a secure bridge.
// The first argument, 'akiraAPI', will be the name of the object attached to the
// renderer's `window` object (i.e., `window.akiraAPI`).
// The second argument is an object defining the functions that will be available
// on `window.akiraAPI`.
contextBridge.exposeInMainWorld('akiraAPI', {
    /**
 * Exposes `window.akiraAPI.getGravatarEmail()`.
 * When called from the renderer, this invokes the "getGravatarEmail" channel
 * in the main process and returns a Promise that resolves with the email string.
 * @returns {Promise<string>}
 */
    getGravatarEmail: () => ipcRenderer.invoke("getGravatarEmail"),
    /**
 * Exposes `window.akiraAPI.getUsername()`.
 * Invokes the "getUsername" channel in the main process.
 * @returns {Promise<string>} A Promise that resolves with the user's name.
 */
    getUsername: () => ipcRenderer.invoke("getUsername"),

    /**
     * Exposes `window.akiraAPI.getBotName()`.
     * Invokes the "getBotName" channel in the main process.
     * @returns {Promise<string>} A Promise that resolves with the bot's name.
     */
    getBotName: () => ipcRenderer.invoke("getBotName"),

    /**
     * Exposes `window.akiraAPI.chat(text)`.
     * Invokes the "chat" channel in the main process, passing the user's message
     * text as an argument.
     * @param {string} text The message content from the user.
     * @returns {Promise<string>} A Promise that resolves with the AI's response.
     */
    chat: (text) => ipcRenderer.invoke("chat", text)
});