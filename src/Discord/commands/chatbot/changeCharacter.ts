import { MessageFlags } from "discord.js";
import { command, commandOptionTypes, user } from "../../index";
import { glob } from "glob";
import fs from "fs";
import path from "path";

let cachedCharacters: Array<{
    name: string,
    file: string
}> = [];

const CHANGE_CHARACTER: command = {
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
    flags: MessageFlags.Ephemeral,

    run: async (APOLLYON, interaction) => {
        if (!(await APOLLYON.db.getCollection("users"))) APOLLYON.db.createCollection("users");

        let userData = await APOLLYON.db.getEntry<user>("users", interaction.user.id);

        if (!userData) {
            APOLLYON.db.createEntry("users", interaction.user.id);

            userData = {
                ai_character: ""
            };
        }

        let character = interaction.options.get("character", true);

        if (typeof character.value !== "string") return interaction.followUp("Failed to get information about the character");

        userData.ai_character = character.value;

        APOLLYON.db.editEntry("users", interaction.user.id, JSON.stringify(userData));

        return interaction.followUp("Changed character!");
    },

    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused();

        if (cachedCharacters.length == 0) {
            await getCharacters();
        }

        const filtered = cachedCharacters.filter((choice) => choice.name.startsWith(focusedValue));

        await interaction.respond(
            filtered.map(choice => ({ name: choice.name, value: choice.file }))
        );
    },
}


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

    setTimeout(getCharacters, 60 * 1000 * 5);
}

export default CHANGE_CHARACTER;
