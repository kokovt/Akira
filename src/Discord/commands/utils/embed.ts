import { EmbedBuilder, MessageFlags } from "discord.js";
import { command, commandOptionTypes } from "../../index";

/**
 * @const {command} EMBED
 * @summary Defines the `/embed` slash command.
 * @description This command takes a string from a user and displays it back
 * in a rich embed format, attributed to the user who ran the command.
 */
const EMBED: command = {
  /**
 * The definition for the slash command to be registered with Discord's API.
 */
  interaction: {
    name: "embed",
    description: "Embeds a message!",
    options: [
      {
        type: commandOptionTypes.STRING,
        name: "message",
        description: "The message to embed",
        required: true
      }
    ]
  },
  flags: [],

  /**
 * The main execution logic for the command.
 * @param {any} APOLLYON - The main application instance.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction object from discord.js.
 */
  run: async (APOLLYON, interaction) => {
    const input = interaction.options.get("message", true);

    // Basic Guard clause: Make sure the input actually exists.
    if (!input || typeof input.value !== "string") return interaction.followUp("Failed to read info!");

    // Create the embed, personalizing it with the author's details.
    const embed = new EmbedBuilder().setTitle(interaction.user.username)
      .setThumbnail(interaction.user.avatarURL())
      .setDescription(input.value);

    // Send the completed embed as a follow-up reply.
    interaction.followUp({
      embeds: [embed]
    })
  }
}

export default EMBED;
