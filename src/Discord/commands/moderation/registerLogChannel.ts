import { EmbedBuilder, MessageFlags } from "discord.js";
import { command, commandOptionTypes, guild } from "../../index";

/**
 * @const {command} REGISTER_LOG_CHANNEL
 * @summary Defines the `/register-log-channel` slash command.
 * @description This administrative command allows a user to designate a specific
 * channel within the server as the destination for the bot's logs and updates.
 * The selected channel ID is then saved to the database for the guild.
 */
const REGISTER_LOG_CHANNEL: command = {
  /**
 * The definition for the slash command to be registered with Discord's API.
 */
  interaction: {
    name: "register-log-channel",
    description: "Registers a channel for logging!",
    options: [{
      name: "channel",
      description: "The channel to send updates in",
      type: commandOptionTypes.CHANNEL,
      required: true
    }]
  },

  /**
 * Sets the response to be ephemeral, so only the command user sees the reply.
 * This is ideal for configuration commands.
 */
  flags: MessageFlags.Ephemeral,

  /**
   * The main execution logic for the command.
   * @param {any} APOLLYON - The main application instance, providing access to the database and client.
   * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction object from discord.js.
   */
  run: async (APOLLYON, interaction) => {
    // Guard clause: Ensure the command is run in a server (guild).
    if (!interaction.guild) return interaction.followUp("This command has to be used in servers!");

    // Retrieve the channel provided in the command's options.
    const channel = interaction.options.get("channel", true);

    // Validate that the option resolved to a channel object.
    if (!channel.channel) return interaction.followUp("Failed to get the channel information!");

    // Fetch the full channel object from the guild's cache to access its methods.
    const channelTest = interaction.guild.channels.cache.get(channel.channel.id);

    // Validate that the bot can actually send messages in the selected channel.
    if (!channelTest?.isSendable()) return interaction.followUp("That isnt a text channel!");

    // --- Database Operations ---
    // Initialize the 'guilds' collection if it doesn't exist.
    if ((await APOLLYON.db.getCollection("guilds")).length == 0) APOLLYON.db.createCollection("guilds");

    // Create a new database entry for this guild if it's the first time.
    if (!APOLLYON.db.getEntry("guilds", interaction.guild.id)) APOLLYON.db.createEntry("guilds", interaction.guild.id);

    // Retrieve the guild's data from the database.
    let data = APOLLYON.db.getEntry<guild>("guilds", interaction.guild.id);

    if (!data) return interaction.followUp("Failed to get data from DB!");

    // Update the data object with the new log channel ID.
    data.logChannelID = channel.channel.id;

    // Save the modified data back to the database.
    APOLLYON.db.editEntry("guilds", interaction.guild.id, JSON.stringify(data));

    // --- User Feedback ---
    // Send a confirmation message to the newly registered log channel.
    channelTest.send({
      embeds: [
        new EmbedBuilder().setTitle("Registered for logs").setDescription("This channel has been registered for logs from " + APOLLYON.CLIENT.user?.username + "!").setColor("#000000")
      ]
    });

    // Send an ephemeral confirmation to the user who ran the command.
    interaction.followUp("Successfully registered the channel!");
    return;
  }
}

export default REGISTER_LOG_CHANNEL;
