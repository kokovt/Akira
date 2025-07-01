const RECORD = require("node-mic-record");
import { nodewhisper } from "nodejs-whisper";
import fs from "fs";
import path from "path";
import { addToHistory } from "./API/api_controller";
import ollama_api from "./API/ollama/ollama_api";
import { getBaseDir } from ".";
import { finished } from 'node:stream/promises';

let firstRun = true;

export default async function handleRecord() {
  let file = fs.createWriteStream(getBaseDir() + "/input.wav", { encoding: "binary" });

  await RECORD.start({
    sampleRate: 16000,  // audio sample rate
    channels: 1,      // number of channels
    threshold: 0.5,    // silence threshold (rec only)
    thresholdStart: null,   // silence threshold to start recording, overrides threshold (rec only)
    thresholdEnd: null,   // silence threshold to end recording, overrides threshold (rec only)
    silence: '1.0',  // seconds of silence before ending
    verbose: false,  // log info to the console
    recordProgram: 'rec',  // Defaults to 'rec' - also supports 'arecord' and 'sox'
    device: null,   // recording device (e.g.: 'plughw:1')
  }).pipe(file);

  await finished(file);
  const filePath = path.resolve(getBaseDir(), "input.wav");
  try {
    await nodewhisper(filePath, {
      modelName: "tiny.en",
      logger: console,
      whisperOptions: {
        outputInText: true,
        wordTimestamps: false
      }
    });
  } catch (err) {
    return handleRecord();
  }

  return fs.readFileSync(path.resolve(getBaseDir(), "input.wav.txt")).toString();
}
