import { EmbedBuilder, MessageFlags } from "discord.js";
import { command } from "../../index"

/**
 * @const {command} ABOUT
 * @summary Defines the `/about` slash command.
 * @description This command provides users with an embed containing general
 * information about the bot, such as its author, version, and technical details.
 */
const ABOUT: command = {
  /**
 * The definition for the slash command to be registered with Discord's API.
 */
  interaction: {
    name: "about",
    description: "Gives information on the bot!"
  },
  /**
 * Sets the response to be ephemeral, meaning only the user who executed the
 * command will see the reply. This is useful for informational commands to
 * avoid cluttering chat channels.
 */
  flags: MessageFlags.Ephemeral,

  /**
   * The main execution logic for the command.
   * @param {any} APOLLYON - The main application instance, providing access to shared resources like the Discord client.
   * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction object from discord.js.
   */
  run: async (APOLLYON, interaction) => {
    // Create a new EmbedBuilder to construct the rich embed message.
    const EMBED = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("Akira/Apollyon")
      .setAuthor({
        name: "Koko",
        url: "https://github.com/kokovt",
        iconURL: "https://avatars.githubusercontent.com/u/67881941?v=4"
      })
      .setDescription("Information about the bot!")
      .setThumbnail(APOLLYON.CLIENT.user?.avatarURL() || "")
      .addFields({
        name: "Developer",
        value: "Koko / Onyx"
      }, {
        name: "Development Language",
        value: "TS/JS"
      }, {
        name: "Version",
        value: "0.2.1"
      })
      // Setting timestamp to 0 or a specific date can be used for aesthetic purposes.
      // To show the current time, you would use .setTimestamp() with no arguments.
      .setTimestamp(0);

    // Send the completed embed as a follow-up reply to the interaction.
    interaction.followUp({ embeds: [EMBED] });

    return;
  }
}

export default ABOUT;
