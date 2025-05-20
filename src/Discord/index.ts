import { ChannelType, Client, Partials } from "discord.js";
import handleTerminal from "../terminal";
import { addToHistory, getHistory, popHistory } from "../API/api_controller";
import ollama_api from "../API/ollama/ollama_api";



let options = {
  includeThinking: false
}; // Make this persist.

// This is going to be simple cause for now I don't think I am going to handle commands.
export default async function handleDiscord() {
  const client = new Client({
    intents: ["DirectMessages"],
    partials: [Partials.Channel]
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot || message.channel.type !== ChannelType.DM) return;

    if (message.author.username !== process.env.OWNER_DISCORD) return;

    const response_message = await message.reply("The bot is generating...");

    addToHistory({ role: "user", content: message.content });

    console.log(JSON.stringify(getHistory()));

    const RESPONSE = await ollama_api(0, "<EOF>", 4096, true); // Update this to be better.

    addToHistory({
      role: "assistant",
      content: RESPONSE
    });

    let messageContent = "";

    messageContent += RESPONSE;

    let split_array = splitIntoChunks(messageContent);

    for (let i = 0; i < split_array.length; i++) {
      response_message.edit(messageContent);
    }
  });

  client.on("ready", () => {
    console.log("[DISCORD] Logged in as " + client.user?.username);
    handleTerminal();
  })

  client.login(process.env.BOT_TOKEN);
}

function splitIntoChunks(message: string) {
  const numChunks = Math.ceil(message.length / 2000);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; i++, o += 2000) {
    chunks[i] = message.substring(o);
  }

  return chunks;
}
