import { EmbedBuilder, Message } from "discord.js";
import { Apollyon, event, guild } from "..";

const messageDelete: event = {
  event: "messageDelete",
  function: async (APOLLYON: Apollyon, args: Array<Message>) => {
    let message = args[0];

    if (!message.guild) return;

    let dbEntry: guild | false = APOLLYON.db.getEntry<guild>("guilds", message.guild.id);

    if (!dbEntry || !dbEntry.logChannelID) return;

    const channel = message.guild.channels.cache.get(dbEntry.logChannelID);
    if (!channel || !channel?.isSendable()) return;


    try {
      channel.send({
        embeds: [
          new EmbedBuilder().setAuthor({
            name: message.author.username,
            iconURL: message.author.avatarURL() ?? ""
          }).setTimestamp(new Date()).setColor("#000000").setDescription(`[-]${message.content}`).setFooter({
            text: "If the bot was offline when or after it was sent, it cannot display the deleted message."
          })
        ]
      })
    } catch (err) {
      channel.send("A message was deleted!\n-# The bot was offline when or after it was sent, and cannot display deleted message");
    }
  }
};

export default messageDelete;
