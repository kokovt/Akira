/**
 * @file Main Renderer Process Logic
 * @summary This script controls the user interface and interactions for the Electron chat application.
 * @description It handles UI state like the sidebar visibility, populates UI elements
 * with data from the main process, and manages the core chat loop: capturing user
 * input, sending it to the main process via the `akiraAPI`, and displaying both
 * the user's message and the AI's response in the chat window.
 */

// --- DOM Element Selection ---
// Get references to all the key interactive elements of the UI.
const toggleButton = document.getElementById("toggle-sidebar-img");
const sidebar = document.getElementById("sidebar");
const mainChat = document.getElementById("main-chat");
const messageHolder = document.getElementById("chat-holder");
const messageBox = document.getElementById("message-box");


// --- UI State ---
// A simple boolean to track the current visibility state of the sidebar.
let sidebarVisible = true;

// --- Initial Data Fetching ---
// On load, request the bot's name from the main process to populate the sidebar header.
window.akiraAPI.getBotName().then((botName) => {
    if (botName) {
        document.getElementById("bot-name").innerText = botName;
    }
});

/**
 * @summary Toggles the visibility of the sidebar and adjusts the main chat area accordingly.
 * @description This function is called by the `onclick` event on the toggle button.
 * It updates the `sidebarVisible` state, hides or shows the sidebar element,
 * changes the toggle button's icon, and resizes the main chat container to fill
 * the available space.
 */
function toggleSidebar() {
    sidebarVisible = !sidebarVisible;
    sidebar.hidden = !sidebar.hidden;

    if (sidebarVisible) {
        // When showing the sidebar:
        toggleButton.src = "./image/close_sidebar.svg";
        mainChat.style.width = "calc(100% - 300px)"; // Shrink main chat
        mainChat.style.left = "300px"; // Move main chat to the right
    } else {
        toggleButton.src = "./image/open_sidebar.svg";
        mainChat.style.width = "100%"; // Expand main chat to full width
        mainChat.style.left = "0px"; // Move main chat to the edge
    }
}

// --- Core Chat Functionality ---
// Listen for key presses in the message input box.
messageBox.onkeyup = async (event) => {
    // Send the message only when the "Enter" key is pressed without the "Shift" key.
    // This allows for multi-line input using Shift+Enter.
    if (event.key == "Enter" && !event.shiftKey) {
        /** @type {string} */
        const value = messageBox.value;
        if (value === "") return; // Don't send empty messages

        messageBox.value = ""; // Clear the input box immediately.

        // --- Display User's Message ---
        const div = document.createElement("div");

        // Sanitize user input to prevent HTML injection before inserting it into the DOM.
        const sanitizedUserValue = value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;")
            .replaceAll("\n", "<br/>");

        // This can be broken out if you want to.
        // It creates a basic webtui box                                          v  This empty div is needed so the username displays on the right.
        div.innerHTML = `<div box-="square" shear-="top"><div class="header"><div></div><span>${document.getElementById("username").textContent}</span></div>${sanitizedUserValue}</div>`;
        messageHolder.appendChild(div);

        // --- Send to Main Process and Await Response ---
        // Call the 'chat' function exposed by the preload script to send the message
        // to the main process and get the AI's response.
        const response = await window.akiraAPI.chat(value);

        // --- Display Bot's Message ---
        const div2 = document.createElement("div");

        // Also sanitize the response from the AI as a good security practice.
        const sanitizedResponse = response
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;")
            .replaceAll("\n", "<br/>");
         // This can be broken out if you want to.
        // It creates a basic webtui box, but since the name is on the left we don't need the empty div
        div2.innerHTML = `<div box-="square" shear-="top"><div class="header"><span>${document.getElementById("bot-name").innerText}</span></div>${sanitizedResponse}</div>`;

        messageHolder.appendChild(div2);
    }
}