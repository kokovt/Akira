import { MessageFlags } from "discord.js";
import { command, commandOptionTypes, user } from "../../index";
import { glob } from "glob";
import fs from "fs";
import path from "path";

/**
 * @type {Array<{name: string, file: string}>}
 * @summary In-memory cache for character data.
 * @description This array stores the display names and file names of available AI
 * characters to provide fast autocomplete responses without reading from the
 * filesystem on every request. It is populated and refreshed by the `getCharacters` function.
 */
let cachedCharacters: Array<{
    name: string,
    file: string
}> = [];

/**
 * @const {command} CHANGE_CHARACTER
 * @summary Defines the `/change_character` slash command.
 * @description This command allows a user to change their currently active AI character persona.
 * It features an autocomplete option that suggests characters as the user types.
 */
const CHANGE_CHARACTER: command = {
    /**
 * The definition for the slash command to be registered with Discord's API.
 */
    interaction: {
        name: "change_character",
        description: "Changes the current character",
        options: [
            {
                type: commandOptionTypes.STRING,
                name: "character",
                description: "The character card to use!",
                required: true,
                autocomplete: true
            }
        ]
    },
    /**
 * Sets the response to be ephemeral, meaning only the user who executed the
 * command will see the reply.
 */
    flags: MessageFlags.Ephemeral,
    /**
     * The main execution logic for the command.
     * @param {any} APOLLYON - The main application instance, providing access to shared resources like the database.
     * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction object from discord.js.
     * @returns A promise that resolves after sending a follow-up message to the user.
     */
    run: async (APOLLYON, interaction) => {
        // Ensure the 'users' collection exists in the database.
        if (!(await APOLLYON.db.getCollection("users"))) APOLLYON.db.createCollection("users");

        let userData = await APOLLYON.db.getEntry<user>("users", interaction.user.id);

        // Retrieve the user's data, or create a new entry if one doesn't exist.
        if (!userData) {
            APOLLYON.db.createEntry("users", interaction.user.id);

            userData = {
                ai_character: ""
            };
        }

        // Get the selected character's file name from the command options.
        let character = interaction.options.get("character", true);

        // Type guard to ensure the option value is a string.
        if (typeof character.value !== "string") return interaction.followUp("Failed to get information about the character");

        // Update the user's data with the new character selection.
        userData.ai_character = character.value;

        // Save the updated data back to the database.
        APOLLYON.db.editEntry("users", interaction.user.id, JSON.stringify(userData));

        return interaction.followUp("Changed character!");
    },

    /**
 * Handles the autocomplete functionality for the 'character' option.
 * @param {import('discord.js').AutocompleteInteraction} interaction - The autocomplete interaction object.
 */
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused();

        // If the cache is empty, populate it for the first time.
        if (cachedCharacters.length == 0) {
            await getCharacters();
        }

        // Filter the cached characters based on the user's input.
        const filtered = cachedCharacters.filter((choice) => choice.name.startsWith(focusedValue));

        // Respond to the interaction with the filtered list of choices.
        // The 'name' is shown to the user, and the 'value' (file name) is sent when they select one.
        await interaction.respond(
            filtered.map(choice => ({ name: choice.name, value: choice.file }))
        );
    },
}

/**
 * Asynchronously reads all character files from the `characterCards` directory,
 * parses them, and populates the `cachedCharacters` array. It then schedules
 * itself to run again after a 5-minute interval to keep the cache fresh.
 */
async function getCharacters() {
    const files = await glob(`${process.cwd().replaceAll("\\", "/")}/characterCards/**/*.json`);
    let characters: Array<{
        name: string,
        file: string
    }> = [];

    for (let i = 0; i < files.length; i++) {
        const data = JSON.parse(fs.readFileSync(files[i]).toString());

        characters.push({
            name: data.character_name,
            file: path.basename(files[i]).replace(".json", "")
        });
    }

    cachedCharacters = characters;

    // Refresh the cache every 5 minutes (60 seconds * 1000 ms * 5).
    setTimeout(getCharacters, 60 * 1000 * 5);
}

// Initial call to populate the cache when the application starts.
getCharacters();

export default CHANGE_CHARACTER;
