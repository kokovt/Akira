import { EmbedBuilder, Message } from "discord.js";
import { Apollyon, event, guild } from "..";

/**
 * @const {event} messageDelete
 * @summary Defines the event handler for when a message is deleted.
 * @description This event listens for message deletions within a server. If the
 * server has a log channel configured in the database, the bot will send an
 * embed to that channel containing the details of the deleted message.
 *
 * @note This functionality is dependent on the message being in the bot's internal
 * cache. If the bot restarts or was offline when the message was originally sent,
 * it may not be able to retrieve the message's content or author details.
 */
const messageDelete: event = {
  /**
 * The name of the discord.js event to listen for.
 */
  event: "messageDelete",
  /**
 * The function that executes when the event is emitted.
 * @param {Apollyon} APOLLYON - The main application instance, providing access to the database.
 * @param {Array<Message>} args - An array of arguments. For `messageDelete`, this contains the `Message` object that was deleted (which may be partial).
 */
  function: async (APOLLYON: Apollyon, args: Array<Message>) => {
    let message = args[0];
    // Guard clause: Ensure the message was deleted from a server, not a DM.
    if (!message.guild) return;
    // Fetch the guild's configuration from the database.
    let dbEntry: guild | false = APOLLYON.db.getEntry<guild>("guilds", message.guild.id);
    // Guard clause: Stop if the guild has no database entry or no log channel is set.
    if (!dbEntry || !dbEntry.logChannelID) return;
    // Fetch the configured log channel from the guild's cache.
    const channel = message.guild.channels.cache.get(dbEntry.logChannelID);
    // Guard clause: Stop if the channel doesn't exist or the bot can't send messages in it.
    if (!channel || !channel?.isSendable()) return;

    // Use a try/catch block to handle errors from partial message objects.
    // If a message wasn't cached, accessing `message.author` or `message.content` will fail.
    try {
      // Attempt to send a rich embed with full message details.
      channel.send({
        embeds: [
          new EmbedBuilder().setAuthor({
            // Using nullish coalescing operator (??) as a safeguard for the icon URL.
            name: message.author.username,
            iconURL: message.author.avatarURL() ?? ""
          }).setTimestamp(new Date()).setColor("#000000").setDescription(`[-]${message.content}`).setFooter({
            text: "If the bot was offline when or after it was sent, it cannot display the deleted message."
          })
        ]
      })
    } catch (err) {
      // If the above fails, send a simpler, plain-text message as a fallback.
      // This ensures that a deletion is always logged, even with partial data.
      channel.send("A message was deleted!\n-# The bot was offline when or after it was sent, and cannot display deleted message");
    }
  }
};

export default messageDelete;
