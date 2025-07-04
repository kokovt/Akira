import { Apollyon, event } from "..";
import { ActivityType } from "discord.js";
import { glob } from "glob";

/**
 * @const {event} ready
 * @summary Defines the event handler for when the bot successfully logs in and is ready.
 * @description This is the primary startup routine for the bot. It performs two main functions:
 * 1. Sets the bot's presence (status and activity) to indicate it's online.
 * 2. Dynamically finds, loads, and registers all slash command files with the Discord API.
 */
const ready: event = {
  /**
 * The name of the discord.js event to listen for.
 */
  event: "ready",

  /**
   * The function that executes when the bot is ready.
   * @param {Apollyon} APOLLYON - The main application instance, containing the client and command collections.
   * @param {...Array<any>} args - Any arguments emitted by the 'ready' event (typically none are used).
   */
  function: async (APOLLYON: Apollyon, ...args: Array<any>) => {
    // Set the bot's presence to "Do Not Disturb" and activity to "Listening to Splat".
    // This provides visual confirmation in Discord that the bot is running.
    APOLLYON.CLIENT.user?.setPresence({
      status: "dnd",
      activities: [{
        name: "to Splat",
        type: ActivityType.Listening
      }]
    });

    // Log a confirmation message to the console.s
    console.log(`${APOLLYON.CLIENT.user?.displayName} is online!`);

    // --- Dynamic Command Loading and Registration ---

    // Use glob to find all compiled JavaScript command files recursively.
    // This looks in the `dist` folder, which is the output of your TypeScript compiler.
    const FILES = await glob(`${process.cwd().replaceAll("\\", "/")}/dist/Discord/commands/**/*.js`);

    // Iterate over each found command file path.
    for (let i = 0; i < FILES.length; i++) {
      // Dynamically import the command file using `require`.
      // We access `.default` because of how ES modules are exported.
      const COMMAND: any = require(FILES[i]).default;

      // Sanity check: ensure the loaded file is a valid command with a name.
      if (!COMMAND.interaction.name) continue;

      // 1. Cache the command: Add the full command object to the bot's internal command list.
      // This list is used by the `interactionCreate` event to execute the command's `run` logic.
      APOLLYON.commands.push(COMMAND);

      // 2. Register the command: Send the command's interaction data (name, description, options)
      // to the Discord API. This is what makes the slash command visible and usable in Discord.
      if (APOLLYON.CLIENT.isReady()) {
        APOLLYON.CLIENT.application.commands.create(COMMAND.interaction);
      }
    }
  }
}

export default ready;