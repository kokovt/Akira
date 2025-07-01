
import { MessageFlags } from "discord.js";
import { command } from "../../index"
const GITHUB: command = {
  interaction: {
    name: "github",
    description: "Sends the github link for this project!"
  },
  flags: MessageFlags.Ephemeral,

  run: async (APOLLYON, interaction) => {
    interaction.followUp("[Github link for Akira/Apollyon](https://github.com/kokovt/Akira)");
  }
}

export default GITHUB;
