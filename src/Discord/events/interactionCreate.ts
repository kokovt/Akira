import { BaseInteraction, MessageFlags } from "discord.js";
import { Apollyon, event } from "..";


const interactionCreate: event = {
  event: "interactionCreate",
  function: async (APOLLYON: Apollyon, args: Array<BaseInteraction>) => {
    const interaction = args[0];
    if (interaction.isAutocomplete()) {
      let autocomplete_interaction: any = interaction;

      for (let i = 0; i < APOLLYON.commands.length; i++) {
        if (APOLLYON.commands[i].interaction.name !== interaction.commandName) continue;
        await APOLLYON.commands[i].autocomplete?.(autocomplete_interaction);
        return;
      }
    }

    if (interaction.isCommand()) {
      for (let i = 0; i < APOLLYON.commands.length; i++) {
        if (APOLLYON.commands[i].interaction.name !== interaction.commandName) continue;

        try {
          await interaction.deferReply({
            flags: APOLLYON.commands[i].flags
          });

          return await APOLLYON.commands[i].run(APOLLYON, interaction);
        } catch (err: any) {
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
