//! Long term: Remove this entirely.
//? Since this is up for removal, I am not documenting this.

import { Message } from "ollama";

const USER_NAME = process.env.USER_NAME;
const BOT_NAME = process.env.BOT_NAME;
const API_TYPE = process.env.API_TYPE || "ollama";
const MAX_CONTENT = Number(process.env.TOKEN_LIMIT || 4096);
const MARKER_LENGTH = Number(process.env.MESSAGE_PAIR_LIMIT || 30);

let history: Array<Message> = [];

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

export function setHistory(inHistory: Array<Message>) {
  history = inHistory;
}

