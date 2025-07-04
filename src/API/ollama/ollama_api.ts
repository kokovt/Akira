//TODO: Rewrite this entire file.
//TODO: This file is not great, and is very short-sighted. Doesn't work well with multiple users.
//TODO: Fix that.

import ollama, { Options, Message } from "ollama";
import { API_TYPE, MAX_CONTENT, addToHistory, getHistory } from "../api_controller";
import fs from "fs";

//? Get the model config.
//TODO: Allow individual users to have their own config.
//! This currently loads the model synchronously with startup, which is unnecessary. Make this asynchronous in the future.
const MODEL_CONFIG = JSON.parse(fs.readFileSync(process.cwd().replaceAll("\\", "/") + "/Config/OllamaModelConfigs.json").toString());

//? Default character. 
//? Works as a fallback or default character for the AI
//TODO: Make this configurable per user / per session.
let currentCharacter = "SpamptonGSpampton";

/**
 * Performs a chat completion request to the Ollama API using the global chat history.
 * This function manages character personas, system prompts, and streams the response.
 *
 * @param tempLevel - A numeric index (e.g., 0, 1, 2) to select a temperature
 *   configuration from `OllamaModelConfigs.json`.
 * @param stop - An optional array of strings that will stop the generation when encountered.
 * @param maxTokens - The maximum number of tokens to generate. Defaults to 4096.
 * @returns A promise that resolves to the complete generated response as a string, or an error message.
 */
export default async function ollama_api(
  tempLevel: number, stop?: Array<string>, 
  maxTokens: number = 4096,
  //TODO: Make this actually used.
  sysPromptAddition: string = ""
) {
  //? Why is this a constant? Shouldn't this be a configurable thing??
  const MODEL = process.env.AKIRA_OLLAMA_MODEL;

  try {
    //? Failsafe to ensure a model is configured.
    if (!MODEL) {
      console.error("No model was given, ignoring.")
      return "No model was given";
    }
    
    //? Get the character card the user wanted from discord.
    //! This assumes the specific user. Make this better.
    if (`${process.cwd().replaceAll("\\", "/")}/database/users/${process.env.OWNER_ID}.json`) {
      currentCharacter = JSON.parse(fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/database/users/${process.env.OWNER_ID}.json`).toString()).ai_character;
    }

    //? Load the character card details from the JSON files. 
    const character_card = JSON.parse(fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/characterCards/${currentCharacter}.json`).toString());

    //! This is important since it tells the AI how to act.
    let systemPrompt: string = character_card.system_prompt;

    //TODO: Remove this.
    //? This helper ensures the system prompt is present in the chat history,
    //? adding it if it's the first message.
    checkSystemPrompt(systemPrompt);

    //? Streaming is generally preferred for
    //? chat applications as it provides a better user experience by showing the
    //? response as it's generated, rather than waiting for the full completion.
    const RESPONSE = await ollama.chat({
      model: MODEL,
      stream: true,
      messages: getHistory(),
      keep_alive: "1h",
      options: getTempuratureOptions(tempLevel, maxTokens)
    });

    //? Stream the response to the console and collect it into a single string
    let output = "";
    for await (const part of RESPONSE) {
      output += part.message.content;
      process.stdout.write(part.message.content);
    }
    console.log("\n");

    //? Add the assistant's complete response to the global history.
    addToHistory({
      role: "assistant",
      content: output
    });
    return output + "\n";
  } catch (err: any) {
    console.log(String(err));
    return "There was an error!";
  }
}

/**
 * Executes a one-off, system-level request to the Ollama API.
 * This function does not use the main chat history, making it suitable for
 * tasks that require a specific, isolated system prompt.
 *
 * @param sysPromptAddition - A string to be appended to the character's name to form the system prompt.
 * @returns A promise that resolves to the generated response string or an error message.
 */
export async function system_ollama_api(sysPromptAddition: string = "") {
  const MODEL = process.env.AKIRA_OLLAMA_MODEL;

  if (API_TYPE !== "ollama") return "Ollama API was not selected. Ignoring request, to make the correct request make a call to " + API_TYPE;
  try {
    if (!MODEL) {
      console.error("No model was given, ignoring.")
      return "No model was given";
    }

    let systemPrompt: string = `$${currentCharacter} \n\n${sysPromptAddition}`;

    const RESPONSE = await ollama.chat({
      model: MODEL,
      stream: true,
      //? This call only sends the system prompt, ignoring any previous chat history.
      messages: [{ role: "system", content: systemPrompt }],
      keep_alive: "1h",
      options: getTempuratureOptions(0, 4096)
    });

    let output = "";

    for await (const part of RESPONSE) {
      output += part.message.content;
      process.stdout.write(part.message.content);
    }
    console.log("\n");

    return output + "\n";
  } catch (err: any) {
    console.log(String(err));
    return "There was an error!";
  }
}

/**
 * A stateless "empty" version of the Ollama API call.
 * It takes an explicit system prompt and message history, rather than using the global state.
 * Includes a basic retry mechanism.
 *
 * @param sysPrompt - The system prompt to use for this specific call.
 * @param messages - An array of `Message` objects representing the conversation history.
 * @param tempLevel - A numeric index for the temperature configuration.
 * @param stop - An optional array of strings to stop generation.
 * @param maxTokens - The maximum number of tokens to generate. Defaults to 4096.
 * @param stream - Whether to stream the response. Defaults to true.
 * @param loops - A counter to prevent infinite retries. The function will exit if loops reaches 4.
 * @returns A promise that resolves to the generated response string or an error/retry message.
 */
export async function empty_ollama_api(sysPrompt: string, messages: Array<Message>, tempLevel: number, stop?: Array<string>, maxTokens: number = 4096, stream: boolean = true, loops: number = 0) {
  const MODEL = process.env.AKIRA_OLLAMA_MODEL;

  // Simple recursion guard.
  if (loops == 4) return "The model failed to create a original response..."
  
  if (API_TYPE !== "ollama") return "Ollama API was not selected. Ignoring request, to make the correct request make a call to " + API_TYPE;
  
  try {
    if (!MODEL) {
      console.error("No model was given, ignoring.")
      return "No model was given";
    }

    // Prepend the systemprompt with the message history.
    const messages_with_sysprompt: Array<Message> = [{
      role: "system",
      content: sysPrompt
    }].concat(messages)

    const RESPONSE = await ollama.chat({
      model: MODEL,
      stream: true,
      messages: messages_with_sysprompt,
      keep_alive: "1h",
      options: getTempuratureOptions(tempLevel, maxTokens)
    });

    let output = "";

    for await (const part of RESPONSE) {
      output += part.message.content;
      process.stdout.write(part.message.content);
    }
    console.log("\n");
    return output + "\n";
  } catch (err: any) {
    console.log(String(err));
    return "There was an error!";
  }
}

/**
 * Generates the Ollama options object based on a temperature level and max tokens.
 * It reads from the `MODEL_CONFIG` JSON file loaded at startup.
 *
 * @param tempLevel - The index of the configuration to use (e.g., 0 for deterministic, 1 for creative).
 * @param maxTokens - The maximum number of tokens the model should generate.
 * @returns A `Partial<Options>` object ready to be used in an `ollama.chat` call.
 */
export function getTempuratureOptions(tempLevel: number, maxTokens: number): Partial<Options> {
  return {
    temperature: MODEL_CONFIG[tempLevel]["temperature"],
    typical_p: MODEL_CONFIG[tempLevel]["min_p"], //TODO: Ollama uses `typical_p`, not `min_p`. Fix that.
    top_p: MODEL_CONFIG[tempLevel]["top_p"],
    top_k: MODEL_CONFIG[tempLevel]["top_k"],
    num_ctx: MAX_CONTENT,
    repeat_penalty: MODEL_CONFIG[tempLevel]['repeat_penalty'],
    num_predict: maxTokens,
    repeat_last_n: MODEL_CONFIG[tempLevel]['repeat_last_n'],
    frequency_penalty: MODEL_CONFIG[tempLevel]['frequency_penalty'],
    presence_penalty: MODEL_CONFIG[tempLevel]["presence_penalty"],
    embedding_only: undefined,
    f16_kv: undefined,
    logits_all: undefined,
    low_vram: false,
    main_gpu: undefined,
    mirostat: undefined,
    mirostat_eta: undefined,
    mirostat_tau: undefined,
    num_batch: undefined,
    num_gpu: 48, //? Hardcoded to use 48 GPU layers.
    num_keep: undefined,
    num_thread: 4, //? Hardcoded to use 4 CPU threads for prompt processing.
    numa: undefined,
    penalize_newline: undefined,
    seed: undefined,
    tfs_z: undefined,
    use_mlock: undefined,
    use_mmap: undefined,
    vocab_only: undefined,
  }
}

/**
 * A utility function to ensure a system prompt exists in the global chat history.
 * If no message with `role: "system"` is found, it adds the provided prompt.
 * This prevents conversations from starting without the AI's persona and instructions.
 *
 * @param systemPrompt - The system prompt string to add to the history if one is not already present.
 */
function checkSystemPrompt(systemPrompt: string) {
  const HISTORY = getHistory();
  let found_history = false;

  //? Check if a system prompt already exists.
  for (let i = 0; i < HISTORY.length; i++) {
    if (HISTORY[i].role == "system") {
      found_history = true;
      break;
    }
  }

  //? If no system message was found, add one.
  if (!found_history) {
    addToHistory({
      role: "system",
      content: systemPrompt
    })
  }
}
