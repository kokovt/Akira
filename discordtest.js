// This script is used for testing tokens.
// Discordjs is programmed in a way where it just bypasses the try catch statements.
const { Client } = require("discord.js");

let token = "";

for(let i = 0; i < process.argv.length; i++) {
    if(process.argv[i].startsWith("--token=")) {
        token = process.argv[i].split("=")[1];
    }
}

const test_client = new Client({ intents: [] });

test_client.login(token);

test_client.on("ready", () => {
    console.log("[DISCORD TOKEN TEST SCRIPT] Logged in as " + test_client.user.username);
    console.log("Token validated, destroying test instance...");
    test_client.destroy();
    process.exit(0);
});