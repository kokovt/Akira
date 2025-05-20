import { readlineQuestion } from "./index";
import { addToHistory, getHistory } from "./API/api_controller";
import ollama_api from "./API/ollama/ollama_api";
import { glob } from "glob";

let commands: {
  [id: string]: {
    command_run: () => void,
    help_function: () => void
  }
} = {};

export default async function handleTerminal() {
  console.log("Registering commands...");
  await registerCommands();

  askQuestion();
}

export async function askQuestion() {
  const input = await readlineQuestion("> ");

  if (input == ":q") {
    commands["/exit"].command_run();
    return;
  }

  if (commands[input]) {
    commands[input].command_run();
    return askQuestion();
  }

  addToHistory({ role: "user", content: input });
  const RESPONSE = await ollama_api(1, "<EOF>", 4096, true); // Update this to be better.

  let message = RESPONSE;

  addToHistory({
    role: "AI",
    content: message
  })
}

async function registerCommands() {
  const files = await glob(`${process.cwd().replaceAll("\\", "/")}/dist/terminalCommands/**/*.js`);

  for (let i = 0; i < files.length; i++) {
    try {
      const command: {
        terminalCommand: () => void,
        helpFunction?: () => string
        name: string
      } = require(files[i]).default;

      if (!command.name || !command.terminalCommand || !command.helpFunction) continue;

      commands["/" + command.name] = {
        command_run: command.terminalCommand,
        help_function: command.helpFunction
      };

      console.log("Registered " + command.name + "!");
    } catch (err) { }
  }
}

export function getCommands() { return commands };
