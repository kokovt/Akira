import { BaseInteraction, MessageFlags } from "discord.js";
import { Apollyon, event } from "..";

/**
 * @const {event} interactionCreate
 * @summary Defines the event handler for all incoming Discord interactions.
 * @description This object acts as the central command router for the bot. It
 * listens for the `interactionCreate` event from discord.js and determines how
 * to process the interaction based on its type (e.g., slash command, autocomplete
 * request). It then finds the corresponding command definition and executes the
 * appropriate logic (`run` or `autocomplete`).
 */
const interactionCreate: event = {
  /**
 * The name of the discord.js event to listen for.
 */
  event: "interactionCreate",

  /**
 * The function that executes when the event is emitted.
 * @param {Apollyon} APOLLYON - The main application instance, which holds state and collections like the command list.
 * @param {Array<BaseInteraction>} args - An array of arguments emitted by the event. For `interactionCreate`, this contains a single `BaseInteraction` object.
 */
  function: async (APOLLYON: Apollyon, args: Array<BaseInteraction>) => {
    // Extract the interaction object from the arguments array.
    const interaction = args[0];

    // --- Autocomplete Handling ---
    // Check if the interaction is an autocomplete request (i.e., the user is typing in an option).
    if (interaction.isAutocomplete()) {
      // TODO: Make a type for this, for type safety.
      let autocomplete_interaction: any = interaction;

      // Iterate through all registered commands to find a match.
      for (let i = 0; i < APOLLYON.commands.length; i++) {

        if (APOLLYON.commands[i].interaction.name !== interaction.commandName) continue;
        // Execute the command's specific `autocomplete` handler.
        // The optional chaining (`?.`) prevents errors if a command has no autocomplete logic.
        await APOLLYON.commands[i].autocomplete?.(autocomplete_interaction);
        // Stop further processing once the correct handler is found and executed.
        return;
      }
    }

    // --- Slash Command Handling ---
    // Check if the interaction is a slash command.
    if (interaction.isCommand()) {
      // Iterate through all registered commands to find a match.
      for (let i = 0; i < APOLLYON.commands.length; i++) {
        if (APOLLYON.commands[i].interaction.name !== interaction.commandName) continue;

        // Wrap the command execution in a try/catch block to handle any runtime errors gracefully.
        try {
          // Acknowledge the interaction immediately by deferring the reply.
          // This prevents the interaction from timing out (Discord requires a
          // response within 3 seconds) while the command's logic is executing.
          await interaction.deferReply({
            flags: APOLLYON.commands[i].flags
          });

          // Execute the command's main `run` function, passing in the bot instance and the interaction.
          return await APOLLYON.commands[i].run(APOLLYON, interaction);
        } catch (err: any) {
          // If an error occurs during command execution, send an ephemeral error message
          // to the user instead of crashing the bot.
          interaction.followUp({
            flags: MessageFlags.Ephemeral,
            content: "Error running command!"
          });
        }
      }
    }
  }
}
export default interactionCreate;
