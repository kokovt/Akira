import { EmbedBuilder, MessageFlags } from "discord.js";
import { command } from "../../index"

const ABOUT: command = {
  interaction: {
    name: "about",
    description: "Gives information on the bot!"
  },
  flags: MessageFlags.Ephemeral,

  run: async (APOLLYON, interaction) => {
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
      .setTimestamp(0);

    interaction.followUp({ embeds: [EMBED] });

    return;
  }
}

export default ABOUT;
