// THIS IS NOT THE RECOMMENDED WAY OF RUNNING THE AI

import ollama, { Options, Message } from "ollama";
import { API_TYPE, BOT_NAME, MAX_CONTENT, USER_NAME, addToHistory, getHistory } from "../api_controller";
import fs from "fs";
import dotenv from "dotenv";


dotenv.config();
const MODEL = process.env.AKIRA_OLLAMA_MODEL;
const MODEL_CONFIG = JSON.parse(fs.readFileSync(process.cwd().replaceAll("\\", "/") + "/Config/OllamaModelConfigs.json").toString());

let currentCharacter = "SpamptonGSpampton";

// This is a perfect example of why typescript sucks
// "Type 'boolean' is not assignable to type 'true'"
export default async function ollama_api(tempLevel: number, stop?: Array<string>, maxTokens: number = 4096, stream: boolean = true, loops: number = 0, sysPromptAddition: string = "") {

  if (loops == 4) return "The model failed to create a original response..."
  if (API_TYPE !== "ollama") return "Ollama API was not selected. Ignoring request, to make the correct request make a call to " + API_TYPE;
  try {
    if (!MODEL) {
      console.error("No model was given, ignoring.")
      return "No model was given";
    }

    if(`${process.cwd().replaceAll("\\", "/")}/database/users/${process.env.OWNER_ID}.json`) {
      currentCharacter = JSON.parse(fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/database/users/${process.env.OWNER_ID}.json`).toString()).ai_character;
    }

    const character_card = JSON.parse(fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/characterCards/${currentCharacter}.json`).toString());

    let systemPrompt: string = character_card.system_prompt;

    checkSystemPrompt(systemPrompt);

    const RESPONSE = await ollama.chat({
      model: MODEL,
      stream: true,
      messages: getHistory(),
      keep_alive: "1h",
      options: getTempuratureOptions(tempLevel, maxTokens)
    });

    let output = "";

    for await (const part of RESPONSE) {
      output += part.message.content;
      process.stdout.write(part.message.content);
    }
    console.log("\n");

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

export async function system_ollama_api(sysPromptAddition: string = "") {
  if (API_TYPE !== "ollama") return "Ollama API was not selected. Ignoring request, to make the correct request make a call to " + API_TYPE;
  try {
    if (!MODEL) {
      console.error("No model was given, ignoring.")
      return "No model was given";
    }

    const character_card = fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/database/users/${process.env.OWNER_ID}`)

    let systemPrompt: string = `$${currentCharacter} \n\n${sysPromptAddition}`; 
    checkSystemPrompt(systemPrompt);

    const RESPONSE = await ollama.chat({
      model: MODEL,
      stream: true,
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

export async function empty_ollama_api(sysPrompt: string, messages: Array<Message>, tempLevel: number, stop?: Array<string>, maxTokens: number = 4096, stream: boolean = true, loops: number = 0) {
  if (loops == 4) return "The model failed to create a original response..."
  if (API_TYPE !== "ollama") return "Ollama API was not selected. Ignoring request, to make the correct request make a call to " + API_TYPE;
  try {
    if (!MODEL) {
      console.error("No model was given, ignoring.")
      return "No model was given";
    }

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

export function getTempuratureOptions(tempLevel: number, maxTokens: number): Partial<Options> {
  return {
    temperature: MODEL_CONFIG[tempLevel]["temperature"],
    typical_p: MODEL_CONFIG[tempLevel]["min_p"],
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
    num_gpu: 48,
    num_keep: undefined,
    num_thread: 4,
    numa: undefined,
    penalize_newline: undefined,
    seed: undefined,
    tfs_z: undefined,
    use_mlock: undefined,
    use_mmap: undefined,
    vocab_only: undefined,
  }
}


function checkSystemPrompt(systemPrompt: string) {
  const HISTORY = getHistory();
  let found_history = false;

  for (let i = 0; i < HISTORY.length; i++) {
    if (HISTORY[i].role == "system") {
      found_history = true;
      break;
    }
  }

  if (!found_history) {
    addToHistory({
      role: "system",
      content: systemPrompt
    })
  }
}
