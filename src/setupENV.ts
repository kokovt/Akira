import { spawn, SpawnOptions } from "child_process";
import ollama from "ollama";
import fs from "fs";
import { closeServer } from "./API/api_controller";
import { readlineQuestion } from "./index";

export default async function setupENV() {

  let valid_answer = false;

  while (!valid_answer) {
    const SHOULD_MAKE_ENV = await readlineQuestion("No .env was detected, and the software might not work as expected. would you like to generate one? (Y/n) ") || "y";
    if (SHOULD_MAKE_ENV.toLowerCase() !== "y" && SHOULD_MAKE_ENV.toLowerCase() !== "n") {
      console.log("Invalid answer! Please type \"y\" or \"n\".");
      continue;
    }
    if (SHOULD_MAKE_ENV.toLowerCase() == "n") return process.exit(); // Replace this with just running the software.   
    valid_answer = true;
  }

  let env_data = "# Get the model so that we can reuse it\n";

  valid_answer = false;

  while (!valid_answer) {
    console.log("https://ollama.com/search");
    const MODEL = await readlineQuestion("What OLLAMA model would you like to use? (nsheth/llama-3-lumimaid-8b-v0.1-iq-imatrix) ") || "nsheth/llama-3-lumimaid-8b-v0.1-iq-imatrix";
    try {
      const stream = await ollama.pull({
        model: MODEL,
        stream: true
      });

      for await (const VALUE of stream) {
        console.log(VALUE.status);
      }

      env_data += `AKIRA_OLLAMA_MODEL=${MODEL}`;
      valid_answer = true;
    } catch (err) {
      console.log("Cannot find that model!");
    }
  }

  valid_answer = false;

  while (!valid_answer) {
    const SHOULD_MAKE_ENV = await readlineQuestion("Should the application clear the console on open? (Y/n) ") || "y";
    if (SHOULD_MAKE_ENV.toLowerCase() !== "y" && SHOULD_MAKE_ENV.toLowerCase() !== "n") {
      console.log("Invalid answer! Please type \"y\" or \"n\".");
      continue;
    }

    env_data += "\n# I like having my applications clear on open, but some people don't";

    if (SHOULD_MAKE_ENV.toLowerCase() == "n") {
      env_data += "CLEAR_ON_OPEN=N";
    } else {
      env_data += "CLEAR_ON_OPEN=Y";
    }
    valid_answer = true;
  }

  const NAME = await readlineQuestion("What should the AI call you? ");
  env_data += "\n\n# So it knows its name, and what to call you.\nUSER_NAME=" + NAME;
  const BOT_NAME = await readlineQuestion("What is the AI's name? (Akira) ") || "Akira";
  env_data += "\nBOT_NAME=" + BOT_NAME;

  let use_discord = false;
  valid_answer = false;

  while (!valid_answer) {
    console.log("If you decide to use this step, you will need to setup a discord bot. Here are the instructions: https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot")
    const SHOULD_USE_DISCORD = await readlineQuestion("Would you like to use the discord plugin? (You can enable this at a later date.) (y/N) ") || "n";
    if (SHOULD_USE_DISCORD.toLowerCase() !== "y" && SHOULD_USE_DISCORD.toLowerCase() !== "n") {
      console.log("Invalid answer! Please type \"y\" or \"n\".");
      continue;
    }

    if (SHOULD_USE_DISCORD.toLowerCase() == "y") {
      use_discord = true;
      env_data += "\n\n# Option to enable discord plugin"
      env_data += "\nUSE_DISCORD=Y";
      valid_answer = true;
      continue;
    }
    valid_answer = true;
    env_data += "\n# Option to enable discord plugin"
    env_data += "\nUSE_DISCORD=N"
  }

  if (use_discord) {
    console.log("For now, the bot will only respond to you. At a later date I might make this optional.");
    const OWNER_DISCORD = await readlineQuestion("What is your discord tag? (case sensitive) ");
    env_data += "\nOWNER_DISCORD=" + OWNER_DISCORD + " # This is that it will only respond to the owner, this might be optional in the future."


    valid_answer = false;

    while (!valid_answer) {
      try {
        const TOKEN = await readlineQuestion("What is the discord bots token? (This is needed to login to the bot.) ")

        const data = await runCommand("node", ["discordtest.js", "--token=" + TOKEN]);

        if (data instanceof Error) {
          console.log(data.cause);
          continue;
        }

        console.log(data.stdout);
        env_data += "\nBOT_TOKEN=" + TOKEN;
        valid_answer = true;
      } catch (err) {
        console.log("Invalid token!");
      }
    }
  }

  fs.writeFileSync(process.cwd().replaceAll("\\", "") + "/.env", env_data);

  console.log("The application will restart itself to reflect the updated changes...");
  restartApplication();
}

function runCommand(command: string, args: Array<string> = [], options: SpawnOptions = {}): Promise<{ exitCode: number; stdout: string; stderr: string; } | Error> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    let stdoutData = '';
    let stderrData = '';

    child.stdout?.on('data', (data) => { stdoutData += data });
    child.stderr?.on('data', (data) => stderrData += data);

    child.on('close', (code) => {
      if (code === 0) {
        resolve({
          exitCode: code,
          stdout: stdoutData,
          stderr: stderrData
        });
      } else {
        reject({
          exitCode: code,
          stdout: stdoutData,
          stderr: stderrData
        });
      }
    });


    child.on('error', (err) => {
      reject(err);
    })
  });
}

function restartApplication() {
  closeServer();
  spawn("npm", ["run", "run"], {
    cwd: process.cwd(),
    detached: true,
    stdio: "inherit"
  }).on("close", () => {
    process.exit(0);
  });
}
