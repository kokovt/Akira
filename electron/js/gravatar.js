/**
 * @file User Data Handler (Renderer Process)
 * @summary This script handles fetching user-specific data (like username and
 * Gravatar profile picture) from the main Electron process and populating the
 * corresponding UI elements in the sidebar.
 * @description It uses the `akiraAPI` object, which is exposed to the renderer
 * process via the `preload.js` script, to make secure IPC calls to the main process.
 */

/**
 * Asynchronously generates a SHA-256 hash of an email address, formatted for use
 * with the Gravatar API.
 * @param {string} email The email address to hash.
 * @returns {Promise<string>} A promise that resolves to the lowercase, hexadecimal SHA-256 hash of the email.
 */
async function getGravatarHash(email) {
    // Gravatar requires the email to be trimmed and in lowercase before hashing.
    email = email.trim().toLowerCase();

    // Gravatar requires the email to be trimmed and in lowercase before hashing.
    const encoder = new TextEncoder();
    const data = encoder.encode(email);
    const hash = await window.crypto.subtle.digest("SHA-256", data);

    // Convert the binary hash data into a hexadecimal string.
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
    return hashHex;
}


// --- Gravatar Profile Picture Handling ---

// Use the exposed API to request the Gravatar email from the main process.
window.akiraAPI.getGravatarEmail().then((email) => {
    // Proceed only if an email was provided in the environment variables.
    if (email) {
        // Fetch the user's profile data from
        // the Gravatar API and set the image source to their avatar URL.
        getGravatarHash(email).then(async (hash) => {
            const data = JSON.parse(await (await fetch(`https://api.gravatar.com/v3/profiles/${hash}`)).text());
            document.getElementById("user-img").src = data["avatar_url"];
        });
    }
});

// --- Username Handling ---
// Request the username from the main process.
window.akiraAPI.getUsername().then((username) => {
    // If a username is returned, update the text content of the #username element.
    if (username) {
        document.getElementById("username").textContent = username;
    }
});
