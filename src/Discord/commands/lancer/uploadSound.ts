import { MessageFlags } from "discord.js";
import { command, commandOptionTypes } from "../../index"
import fetch from "node-fetch";
import fs from "fs";
/**
 * @const {command} BUTTON
 * @summary Defines the `/button` slash command.
 * @description A soundboard-style command. When executed by a user in a voice
 * channel, the bot will join the channel, play a specific sound file ("rahh.mp3"),
 * and then leave.
 */
const BUTTON: command = {
    /**
   * The definition for the slash command to be registered with Discord's API.
   */
    interaction: {
        name: "upload_sound",
        description: "uploads a sound",
        options: [
            {
                name: "sound",
                description: "sound to upload",
                required: true,
                type: commandOptionTypes.ATTATCHMENTS
            }
        ],
    },

    /**
   * Sets the response to be ephemeral. Any text replies will only be visible
   * to the user who ran the command.
   */
    flags: MessageFlags.Ephemeral,
    /**
   * The main execution logic for the command.
   * @param {any} APOLLYON - The main application instance.
   * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction object from discord.js.
   */
    run: async (APOLLYON, interaction) => {
        const file = interaction.options.get("sound", true);
        console.log(file.attachment?.name);

        if(!file.attachment) return interaction.followUp("failed to get file data.");

        if(!file.attachment.name.endsWith(".mp3")) return interaction.followUp("Bad file!");
        fetch(file.attachment?.url).then(res => {
            res.body?.pipe(fs.createWriteStream(`${process.cwd().replaceAll("\\", "/")}/sounds/${file.attachment?.name}`));
        });

        interaction.followUp("Installed file!");

    }
}

export default BUTTON;
