import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import readlinePK from "readline";
import setupExpress, { closeServer } from "./API/api_controller";
import setupENV from "./setupENV";
import handleTerminal, { askQuestion } from "./terminal";
import handleDiscord from "./Discord";

if (process.env.CLEAR_ON_OPEN == "Y") {
  console.clear();
}

console.log("Akira personal assistant v0.1.0\nTo view changelog, type \"/changelog v0.1.0\".");

// THIS SHOULD NEVER BE CHANGED OUTSIDE OF WHEN LOGGING.
let READLINE = readlinePK.createInterface({
  input: process.stdin,
  output: process.stdout
});

READLINE.on("SIGINT", () => {
  console.log("Please type /exit to exit.");
});

READLINE.on("SIGTSTP", () => {
  console.log("Please type /exit to exit.");
})

export default READLINE;
if (!fs.existsSync(process.cwd().replaceAll("\\", "") + "/.env")) {
  setupENV();
} else {
  setupExpress();

  if (process.env.USE_DISCORD?.toLowerCase() == "y") {
    handleDiscord();
  } else {
    handleTerminal();
  }
}

process.on("beforeExit", () => {
  closeServer();
  READLINE.close();
});


export function readlineQuestion(question: string): Promise<string> {
  return new Promise(resolve => {
    READLINE.question(question, resolve);
  });
}
