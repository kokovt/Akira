import { Message, ChannelType } from "discord.js";
import { Apollyon, event, user } from "..";
import { addToHistory, BOT_NAME } from "../../API/api_controller";
import { Message as OMessage } from "ollama";
import fs from "fs";
import ollama_api, { empty_ollama_api } from "../../API/ollama/ollama_api";

const defaultCharacterCard = "SpamptonGSpampton";

const messageCreate: event = {
  event: "messageCreate",
  function: async (APOLLYON: Apollyon, args: Array<Message>) => {
    if (!APOLLYON.CLIENT.user?.id) return;
    if (args[0].author.bot || (args[0].channel.type !== ChannelType.DM && !args[0].mentions.has(APOLLYON.CLIENT.user?.id))) return;
    // if (!(args[0].author.id == "678788394519756800" || args[0].author.id == "712306931301220373")) return;

    let message = args[0];

    const userInfo = APOLLYON.db.getEntry<user>("users", message.author.id);

    
    let currentCharacter = "";
    
    if(!userInfo || !userInfo.ai_character) {
      currentCharacter = "SpamptonGSpampton";
    } else {
      console.log(userInfo.ai_character);
      currentCharacter = userInfo.ai_character;
    }

    if (message.reference?.messageId) {
      let messages: Array<OMessage> = [];

      messages.push({
        role: "User",
        content: `${message.author.username}: ${message.content.replaceAll("<@1360780810462171217>", "")}`
      });

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

      const character_card = JSON.parse(fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/characterCards/${currentCharacter}.json`).toString());
      let systemPrompt: string = character_card.system_prompt;

      let bMesssage = await empty_ollama_api(systemPrompt, messages, 0);

      if (bMesssage.length < 2000) return message.reply(bMesssage);

      let split = bMesssage.split(/.{1,1999}/g);
      if (!split) return;
      message.reply(split[0]);

      console.log(split[0].length)

      if (split.length > 1) {
        for (let i = 1; i < split.length; i++) {
          if (message.channel.isSendable()) {
            if (split[i].trimEnd() == "") continue;
            message.channel.send(split[i]);
          }
        }
      }

      return;
    }

    if (message.author.id != "678788394519756800") {
      const character_card = JSON.parse(fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/characterCards/${currentCharacter}.json`).toString());

      let systemPrompt: string = character_card.system_prompt;
      let messages: Array<OMessage> = [{
        role: "User",
        content: message.content
      }];

      let bMessage = await empty_ollama_api(systemPrompt, messages, 0);

      if (bMessage.length < 2000) return message.reply(bMessage);

      let split = bMessage.match(/.{1,1999}/g);
      if (!split) return;



      await message.reply(split[0]);

      if (split.length > 1) {
        for (let i = 1; i < split.length; i++) {
          if (message.channel.isSendable()) {
            if (split[i].trimEnd() == "") continue;
            await message.channel.send(split[i]);
          }
        }
      }
      return;
    }
    addToHistory({ role: "user", content: message.content });

    const RESPONSE = await ollama_api(0, undefined, 4096, true);

    addToHistory({
      role: "assistant",
      content: RESPONSE
    });

    let messageContent = "";
    messageContent += RESPONSE;

    if (messageContent.length < 2000) return message.reply(messageContent);

    let split_array = messageContent.match(/.{1,1999}/g);
    if (!split_array) return;

    await message.reply(split_array[0]);

    for (let i = 1; i < split_array.length; i++) {
      if (message.channel.isSendable()) {
        if (split_array[i].trimEnd() == "") continue;
        message.channel.send(split_array[i]);
      };
    }
  }
};

export default messageCreate;


