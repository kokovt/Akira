import express from "express";
import ollama_api from "./ollama/ollama_api";
import { ParsedQs } from "qs";
import { Message } from "ollama";
import { Server } from "http";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 4000;
const USER_NAME = process.env.USER_NAME;
const BOT_NAME = process.env.BOT_NAME;
const API_TYPE = process.env.API_TYPE || "ollama";
const MAX_CONTENT = Number(process.env.TOKEN_LIMIT || 4096);
const MARKER_LENGTH = Number(process.env.MESSAGE_PAIR_LIMIT || 30);
const APP = express();
const ROUTER = APP.router;


let server: Server | undefined;

let history: Array<Message> = [];
export default async function setupExpress() {
  ROUTER.get("/chat", async (req, res) => {
    const message: string | ParsedQs | (string | ParsedQs)[] | undefined = req.query["message"];

    if (typeof message !== "string" || !message) {
      res.send("Failed to get data");
      return;
    }

    addToHistory({
      role: "user",
      content: message
    });

    if (API_TYPE == "ollama") {
      try {
        res.send(await ollama_api(0, "\n", MAX_CONTENT, false));
      } catch (err) {
        res.send("There was an error!");
      }
      return;
    }
  });

  APP.use("/", ROUTER);
  server = APP.listen(PORT, (err) => { if (err) console.error(err) });
}

export function closeServer() {
  console.log("[Express]: Closing connection.");
  server?.closeAllConnections();
}

export {
  MAX_CONTENT,
  API_TYPE,
  USER_NAME,
  BOT_NAME
};


export function getHistory() {
  return history;
}

export function addToHistory(message: Message) {
  history.push(message);
  if (history.length > MARKER_LENGTH * 2) history.pop();
}

export function clearHistory() {
  history = [];
}

export function popHistory() {
  history.pop();
}
