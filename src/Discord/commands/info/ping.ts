
import { MessageFlags } from "discord.js";
import { command } from "../../index"
const PING: command = {
  interaction: {
    name: "ping",
    description: "Replies with pong!"
  },
  flags: MessageFlags.Ephemeral,

  run: async (APOLLYON, interaction) => {
    interaction.followUp("pong!");
  }
}

export default PING;
