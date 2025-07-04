
import { MessageFlags } from "discord.js";
import { command } from "../../index";

/**
 * @const {command} PING
 * @summary Defines the `/ping` slash command.
 * @description A simple "health check" command. When executed, the bot replies
 * with "pong!", confirming that it is online and responsive.
 */
const PING: command = {
  /**
 * The definition for the slash command to be registered with Discord's API.
 */
  interaction: {
    name: "ping",
    description: "Replies with pong!"
  },

  /**
 * Sets the response to be ephemeral, meaning only the user who executed the
 * command will see the reply. This is ideal for simple utility commands
 * to prevent channel spam.
 */
  flags: MessageFlags.Ephemeral,

  /**
 * The main execution logic for the command.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction object from discord.js.
 */
  run: async (_, interaction) => {
    // Send a simple follow-up reply to the interaction.
    interaction.followUp("pong!");
  }
}

export default PING;
