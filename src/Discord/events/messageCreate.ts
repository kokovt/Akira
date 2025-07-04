import { Message, ChannelType } from "discord.js";
import { Apollyon, event, user } from "..";
import { addToHistory, BOT_NAME } from "../../API/api_controller";
import { Message as OMessage } from "ollama";
import fs from "fs";
import ollama_api, { empty_ollama_api } from "../../API/ollama/ollama_api";

//TODO: Rewrite this when I fix history.
const defaultCharacterCard = "SpamptonGSpampton";

/**
 * @const {event} messageCreate
 * @summary Defines the event handler for new messages.
 * @description This is the primary entry point for the bot's AI chat functionality.
 * It activates when the bot is mentioned in a server channel or receives a Direct Message.
 * The handler has three distinct logic paths:
 * 1.  **Reply Chain Context**: If the message is a reply, it walks up the chain to build temporary context for a stateless API call.
 * 2.  **Bot Owner Context**: If the message is from the bot owner (identified by a hardcoded ID), it uses a persistent, stateful chat history.
 * 3.  **Standard User Context**: For any other user, it performs a stateless, one-off API call using only the current message as context.
 */
const messageCreate: event = {
  event: "messageCreate",
  function: async (APOLLYON: Apollyon, args: Array<Message>) => {
    // --- Pre-condition Checks ---
    // 1. Ensure the client user is available.
    if (!APOLLYON.CLIENT.user?.id) return;
    // 2. Ignore messages from other bots.
    // 3. In servers, only respond to direct mentions. In DMs, respond to all messages.
    if (args[0].author.bot || (args[0].channel.type !== ChannelType.DM && !args[0].mentions.has(APOLLYON.CLIENT.user?.id))) return;
    let message = args[0];

    // --- Character Selection ---
    // Determine which AI character persona to use for the response.
    const userInfo = APOLLYON.db.getEntry<user>("users", message.author.id);
    let currentCharacter = !userInfo || !userInfo.ai_character ? defaultCharacterCard : userInfo.ai_character;


    // --- Logic Path 1: Handling Replies (Conversation Threads) ---
    if (message.reference?.messageId) {
      let messages: Array<OMessage> = [];
      // Add the user's latest message to the history.
      messages.push({
        role: "User",
        content: `${message.author.username}: ${message.content.replaceAll("<@1360780810462171217>", "")}`
      });

      // Walk up the reply chain to build context.
      let currentMessage = message;
      while (currentMessage.reference) {
        if (!currentMessage.reference.messageId) break;
        const repliedTo = await message.channel.messages.fetch(currentMessage.reference.messageId);

        messages.push({
          role: "User",
          content: repliedTo.content
        });

        currentMessage = repliedTo;
      }
      messages.reverse(); // Ensure chronological order for the API.

      const character_card = JSON.parse(fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/characterCards/${currentCharacter}.json`).toString());
      let systemPrompt: string = character_card.system_prompt;
      // Use a stateless API call with the constructed conversation history.
      let response = await empty_ollama_api(systemPrompt, messages, 0);
      await sendChunkedReply(message, response);
      return;
    }

    // --- Logic Path 2: Standard User Interaction (Stateless) ---
    // This is the default behavior for any user who is not the owner and is not replying to a message.
    if (message.author.id != process.env.OWNER_ID) {
      // Add the user's message to the persistent, global chat history.
      const character_card = JSON.parse(fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/characterCards/${currentCharacter}.json`).toString());

      let systemPrompt: string = character_card.system_prompt;
      let messages: Array<OMessage> = [{
        role: "User",
        content: message.content
      }];

      let response = await empty_ollama_api(systemPrompt, messages, 0);
      await sendChunkedReply(message, response);
      return;
    }

    // --- Logic Path 3: Special Case for Bot Owner (Stateful History) ---
    // TODO: Make everything have Stateful History.
    // Add the user's message to the persistent, global chat history.
    addToHistory({ role: "user", content: message.content.replace("<@1360780810462171217>", "") });
    
    // Call the stateful API which uses the global history.
    const response = await ollama_api(0, undefined, 4096);
    await sendChunkedReply(message, response);
  }
};

/**
 * @summary A helper function to handle sending long messages.
 * @description Splits a string into chunks of 1999 characters and sends them as
 * a reply followed by subsequent messages in the same channel. This avoids the
 * Discord 2000-character limit.
 * @param {Message} message - The original message object to reply to.
 * @param {string} content - The full string content to send.
 */
async function sendChunkedReply(message: Message, content: string) {
  if (!content) return;

  if(content.length <= 1999 && message.channel.isSendable()) {
    await message.channel.send(content);
    return;
  }

  // Use .match() to split the string into an array of chunks.
  const chunks = content.match(/.{1,1999}/g);
  if(!chunks) return;
  if(chunks.length = 0) return;

  // Send the chunks as messages in the channel.
  for (let i = 0; i < chunks.length; i++) {
    if (message.channel.isSendable() && chunks[i].trim() !== "") {
      await message.channel.send(chunks[i]);
    }
  }
}

export default messageCreate;


