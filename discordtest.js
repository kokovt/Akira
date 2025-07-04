/**
 * @file Discord Token Validation Script
 * @summary A standalone Node.js script to test the validity of a Discord bot token.
 * @description This utility script takes a Discord token as a command-line argument,
 * attempts to log in with it, and reports success if the login is accepted by
 * Discord's API. If the login fails (due to an invalid or missing token), the
 * script will throw an error and exit with a non-zero status code.
 *
 * @example
 * To run this script from your terminal:
 * node discordtest.js --token=YOUR_DISCORD_BOT_TOKEN_HERE
 */

const { Client } = require("discord.js");

/**
 * Holds the token provided via command-line arguments.
 * Declared in the global scope to be accessible throughout the script after parsing.
 * @type {string}
 */
let token = "";

// --- Argument Parsing ---
// This loop iterates through the command-line arguments provided when running the script.
// Example: `node discordtest.js --token=DISCORD_TOKEN`
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].startsWith("--token=")) {
        token = process.argv[i].split("=")[1];
    }
}

// --- Client Initialization and Login ---
// A new, lightweight Discord client is created with default intents.
// No explicit check for the token is needed here; the `.login()` method
// will throw a fatal error if the token is missing, malformed, or invalid.
const test_client = new Client();
test_client.login(token);

// --- Success Handler ---
// The 'ready' event only fires after a successful login and connection to Discord's gateway.
// This acts as our confirmation that the token is valid.
test_client.on("ready", () => {
    // Let the user know that the script worked and which bot the token belongs to.
    console.log("[DISCORD TOKEN TEST SCRIPT] Logged in as " + test_client.user.username);
    console.log("Token validated, destroying test instance...");

    // It's good practice to destroy the client to close the connection gracefully.
    test_client.destroy();
    // Exiting with code 0 signals that the script completed successfully.
    process.exit(0);
});