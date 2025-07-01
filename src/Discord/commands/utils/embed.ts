import { EmbedBuilder, MessageFlags } from "discord.js";
import { command, commandOptionTypes } from "../../index";

const EMBED: command = {
  interaction: {
    name: "embed",
    description: "Embeds a message!",
    options: [
      {
        type: commandOptionTypes.USER,
        name: "message",
        description: "The message to embed",
        required: true
      }
    ]
  },
  flags: MessageFlags.Ephemeral,

  run: async (APOLLYON, interaction) => {
    const input = interaction.options.get("message", true);

    if(!input || typeof input.value !== "string") return interaction.followUp("Failed to read info!");

    const embed = new EmbedBuilder().setTitle(interaction.user.username)
        .setThumbnail(interaction.user.avatarURL())
        .setDescription(input.value);

    interaction.followUp({
        embeds: [embed]
    })
  }
}

export default EMBED;
