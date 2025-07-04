import { ChannelType, Client, Partials, ActivityType, Message, CommandInteraction, GatewayIntentBits, AutocompleteInteraction, MessageFlags, BitFieldResolvable, MessageFlagsString, ClientEvents } from "discord.js";
import { addToHistory } from "../API/api_controller";
import ollama_api from "../API/ollama/ollama_api";
import { glob } from "glob";
import DATABASE from "../database/dbclass";

/**
 * @summary The main entry point for initializing the Discord bot.
 * @description This function checks for the required bot token from environment
 * variables and then instantiates the `Apollyon` class, which starts the bot's
 * entire lifecycle, including logging in and setting up event handlers.
 */
export default async function handleDiscord() {
  // Guard clause: Ensure the bot token is provided before attempting to start.
  if (!process.env.BOT_TOKEN) return;
  const APPOLYON = new Apollyon(process.env.BOT_TOKEN, {
    intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],
    partials: [Partials.Channel, Partials.Message]
  });
}

/**
 * @class Apollyon
 * @summary The main class that encapsulates the Discord bot's logic and state.
 * @description This class holds the discord.js `Client` instance, a list of all
 * loaded commands, and a connection to the database. It is responsible for
 * initializing the bot, logging in, and dynamically loading all event handlers.
 */
export class Apollyon {
  /** The raw discord.js Client instance. */
  CLIENT: Client;
  /** An in-memory array to hold all loaded command definitions. */
  commands: Array<command>;
  /** An instance of the custom DATABASE class for file-system storage. */
  db: DATABASE;

  /**
 * @constructor
 * @param {string} token - The bot's authentication token.
 * @param {object} options - Configuration options for the discord.js client.
 * @param {Array<GatewayIntentBits>} [options.intents] - The intents to enable for the bot.
 * @param {Array<Partials>} [options.partials] - Partials to enable, allowing events for uncached entities.
 */
  constructor(token: string, options: {
    intents?: Array<GatewayIntentBits>,
    partials?: Array<Partials>
  }) {
    this.CLIENT = new Client({
      intents: options.intents || [],
      partials: options.partials || []
    });

    this.commands = [];
    this.db = new DATABASE();

    // Asynchronously load all event handlers before logging in.
    this.#handleEvents();
    // Log the client into Discord.
    this.CLIENT.login(token);
  }

  /**
   * @private
   * @async
   * @summary Dynamically loads and attaches all event handlers.
   * @description This private method scans the `dist/Discord/events` directory
   * for compiled event handler files. For each file found, it imports the event
   * definition and uses the `client.on()` method to register its function as a
   * listener for the specified event. This allows for a modular, file-based event system.
   */
  async #handleEvents() {
    const EVENTS = await glob(`${process.cwd().replaceAll("\\", "/")}/dist/Discord/events/**/*.js`);

    for (let i = 0; i < EVENTS.length; i++) {
      const EVENT: event = require(EVENTS[i]).default;

      // Attach the listener, passing the Apollyon instance and event args to the handler function.
      this.CLIENT.on(EVENT.event, (...args) => {
        EVENT.function(this, args);
      });
    }
  }
}


// ###########
// ## TYPES ##
// ###########
/**
 * @typedef {object} event
 * @summary Defines the structure for a modular event handler file.
 * @property {string} event - The name of the discord.js event to listen for (e.g., 'ready', 'messageCreate').
 * @property {(APOLLYON: Apollyon, args: Array<any>) => Promise<any>} function - The async function to execute when the event fires.
 */
export type event = {
  event: string,
  function: (APOLLYON: Apollyon, args: Array<any>) => Promise<any>
}


/**
 * @typedef {object} command
 * @summary Defines the structure for a slash command file.
 * @property {object} interaction - The command's definition for the Discord API.
 * @property {BitFieldResolvable<...>} flags - Message flags, typically used to make a response ephemeral.
 * @property {(Apollyon: Apollyon, interaction: CommandInteraction) => Promise<any>} run - The main execution logic for the command.
 * @property {(interaction: AutocompleteInteraction) => Promise<any>} [autocomplete] - Optional handler for autocomplete interactions.
 */
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

/**
 * @typedef {object} commandOption
 * @summary Defines the structure for a single option within a slash command.
 */
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

/**
 * @typedef {object} guild
 * @summary Defines the data structure for a guild's entry in the database.
 * @property {string} [logChannelID] - The ID of the channel designated for logs.
 */
export type guild = {
  logChannelID?: string
}

/**
 * @typedef {object} user
 * @summary Defines the data structure for a user's entry in the database.
 * @property {string} [ai_character] - The file name of the user's selected AI character.
 */
export type user = {
  ai_character?: string
}

/**
 * @const
 * @summary An enum-like object mapping command option type names to their
 * corresponding Discord API integer values.
 * @description This provides a readable and maintainable way to specify the
 * type of a slash command option, rather than using magic numbers.
 */
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
