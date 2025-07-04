import { EmbedBuilder, Message } from "discord.js";
import { Apollyon, event, guild } from "..";

/**
 * @const {event} messageUpdate
 * @summary Defines the event handler for when a message is edited.
 * @description This event listens for message edits within a server. If a log
 * channel is configured for that server, the bot sends an embed detailing the
 * original and updated content of the message.
 *
 * @note The content of the `oldMessage` is only available if the message was in
 * the bot's internal cache at the time of the edit. If the bot was offline when
 * the message was sent, the old content cannot be displayed.
 */
const messageUpdate: event = {
  /**
 * The name of the discord.js event to listen for.
 */
  event: "messageUpdate",

  /**
 * The function that executes when the event is emitted.
 * @param {Apollyon} APOLLYON - The main application instance, providing access to the database.
 * @param {Array<Message>} args - An array of arguments. For `messageUpdate`, this contains the `oldMessage` and `newMessage` objects.
 */
  function: async (APOLLYON: Apollyon, args: Array<Message>) => {
    let oldMessage = args[0];
    let newMessage = args[1];

    // Guard clause: Ensure the edit happened in a server.
    if (!newMessage.guild) return;
    // Fetch the guild's configuration from the database.
    let dbEntry: guild | false = APOLLYON.db.getEntry<guild>("guilds", newMessage.guild.id);
    // Guard clause: Stop if the guild has no database entry or no log channel is set.
    if (!dbEntry || !dbEntry.logChannelID) return;
    // Fetch the configured log channel from the guild's cache.
    const channel = newMessage.guild.channels.cache.get(dbEntry.logChannelID);
    // Guard clause: Stop if the channel doesn't exist or the bot can't send messages in it.
    if (!channel || !channel?.isSendable()) return;

    channel.send({
      // Construct a detailed embed for the log.
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
