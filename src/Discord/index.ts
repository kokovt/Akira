import { ChannelType, Client, Partials, ActivityType, Message, CommandInteraction, GatewayIntentBits, AutocompleteInteraction, MessageFlags, BitFieldResolvable, MessageFlagsString, ClientEvents } from "discord.js";
import { addToHistory } from "../API/api_controller";
import ollama_api from "../API/ollama/ollama_api";
import { glob } from "glob";
import DATABASE from "../database/dbclass";

// This is going to be simple cause for now I don't think I am going to handle commands.
export default async function handleDiscord() {
  if (!process.env.BOT_TOKEN) return;
  const APPOLYON = new Apollyon(process.env.BOT_TOKEN, {
    intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],
    partials: [Partials.Channel, Partials.Message]
  });
}

export class Apollyon {
  CLIENT: Client;
  commands: Array<command>;
  db: DATABASE;
  constructor(token: string, options: {
    intents?: Array<GatewayIntentBits>,
    partials?: Array<Partials>
  }) {
    this.CLIENT = new Client({
      intents: options.intents || [],
      partials: options.partials || []
    });

    this.commands = [];
    this.#handleEvents();
    this.CLIENT.login(token);
    this.db = new DATABASE();
  }


  async #handleEvents() {
    const EVENTS = await glob(`${process.cwd().replaceAll("\\", "/")}/dist/Discord/events/**/*.js`);

    for (let i = 0; i < EVENTS.length; i++) {
      const EVENT: event = require(EVENTS[i]).default;

      this.CLIENT.on(EVENT.event, (...args) => {
        EVENT.function(this, args);
      });
    }
  }
}


// ###########
// ## TYPES ##
// ###########
export type event = {
  event: string,
  function: (APOLLYON: Apollyon, args: Array<any>) => Promise<any>
}

export type command = {
  interaction: {
    type?: 1 | 2 | 3;
    name: string;
    name_localizations?: { [id: string]: string };
    description: string;
    description_localizations?: {};
    options?: Array<commandOption>;
    default_member_permissions?: string;
    default_permission?: boolean;
  };
  flags: BitFieldResolvable<Extract<MessageFlagsString, 'Ephemeral'>, MessageFlags.Ephemeral> | undefined;
  run: (Apollyon: Apollyon, interaction: CommandInteraction) => Promise<any>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<any>;
}

export type commandOption = {
  type: number;
  name: string;
  name_localizations?: { [id: string]: string };
  description: string;
  description_localizations?: { [id: string]: string };
  required?: boolean;
  choices?: Array<{
    name: string;
    name_localizations?: { [id: string]: string };

    value: number | string;
  }>;
  options?: Array<commandOption>;
  channel_type?: { [id: string]: string };
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
  autocomplete?: boolean;
}

export type guild = {
  logChannelID?: string
}

export type user = {
  ai_character?: string
}


export const commandOptionTypes = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
  MENTIONABLE: 9,
  NUMBER: 10,
  ATTATCHMENTS: 11
}
