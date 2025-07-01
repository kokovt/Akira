import { EmbedBuilder, MessageFlags } from "discord.js";
import { command, commandOptionTypes, guild } from "../../index"
const ADDROLE: command = {
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
  flags: MessageFlags.Ephemeral,

  run: async (APOLLYON, interaction) => {
    if (!interaction.guild) return interaction.followUp("This command has to be used in servers!");

    const channel = interaction.options.get("channel", true);

    if (!channel.channel) return;
    const channelTest = interaction.guild.channels.cache.get(channel.channel.id);

    if (!channelTest?.isSendable()) return interaction.followUp("That isnt a text channel!");



    if ((await APOLLYON.db.getCollection("guilds")).length == 0) APOLLYON.db.createCollection("guilds");

    if (!APOLLYON.db.getEntry("guilds", interaction.guild.id)) APOLLYON.db.createEntry("guilds", interaction.guild.id);

    let data = APOLLYON.db.getEntry<guild>("guilds", interaction.guild.id);

    if (!data) return interaction.followUp("Failed to get data from DB!");

    data.logChannelID = channel.channel.id;

    APOLLYON.db.editEntry("guilds", interaction.guild.id, JSON.stringify(data));

    channelTest.send({
      embeds: [
        new EmbedBuilder().setTitle("Registered for logs").setDescription("This channel has been registered for logs from " + APOLLYON.CLIENT.user?.username + "!").setColor("#000000")
      ]
    });

    interaction.followUp("Successfully registered the channel!");

    return;
  }
}

export default ADDROLE;
