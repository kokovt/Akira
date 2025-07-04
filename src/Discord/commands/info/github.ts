
import { MessageFlags } from "discord.js";
import { command } from "../../index"

/**
 * @const {command} GITHUB
 * @summary Defines the `/github` slash command.
 * @description This command provides users with a direct link to the bot's
 * GitHub repository.
 */
const GITHUB: command = {
  /**
 * The definition for the slash command to be registered with Discord's API.
 */
  interaction: {
    name: "github",
    description: "Sends the github link for this project!"
  },

  /**
 * Sets the response to be ephemeral, meaning only the user who executed the
 * command will see the reply. This keeps the channel clean from repeated
 * informational messages.
 */
  flags: MessageFlags.Ephemeral,

  /**
 * The main execution logic for the command.
 * @param {any} APOLLYON - The main application instance (not used in this command).
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction object from discord.js.
 */
  run: async (APOLLYON, interaction) => {
    // Send a follow-up reply containing the formatted hyperlink to the GitHub repository.
    interaction.followUp("[Github link for Akira/Apollyon](https://github.com/kokovt/Akira)");
  }
}

export default GITHUB;
