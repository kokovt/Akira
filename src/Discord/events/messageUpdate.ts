import { EmbedBuilder, Message } from "discord.js";
import { Apollyon, event, guild } from "..";

const messageUpdate: event = {
  event: "messageUpdate",
  function: async (APOLLYON: Apollyon, args: Array<Message>) => {
    let oldMessage = args[0];
    let newMessage = args[1];

    if (!newMessage.guild) return;

    let dbEntry: guild | false = APOLLYON.db.getEntry<guild>("guilds", newMessage.guild.id);

    if (!dbEntry || !dbEntry.logChannelID) return;

    const channel = newMessage.guild.channels.cache.get(dbEntry.logChannelID);
    if (!channel || !channel?.isSendable()) return;

    channel.send({
      embeds: [
        new EmbedBuilder().setAuthor({
          name: newMessage.author.username,
          iconURL: newMessage.author.avatarURL() ?? ""
        }).setTimestamp(new Date()).setColor("#000000").setDescription(`[-]${oldMessage.content}\n[+] ${newMessage.content}`).setFooter({
          text: "If the bot was offline when or after it was sent, it cannot display the old message."
        })
      ]
    })
  }
};

export default messageUpdate;
