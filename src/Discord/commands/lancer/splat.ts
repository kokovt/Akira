import { GuildMember, MessageFlags } from "discord.js";
import { command, commandOptionTypes } from "../../index"
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior } from "@discordjs/voice";

/**
 * @const {command} SPLAT
 * @summary Defines the `/splat` slash command.
 * @description A targeted soundboard command. It allows the user to select
 * another member in the server. The bot will then join that member's voice channel,
 * play a sound, and disconnect.
 */
const SPLAT: command = {
  /**
 * The definition for the slash command to be registered with Discord's API.
 */
  interaction: {
    name: "splat",
    description: "splat",
    options: [
      {
        type: commandOptionTypes.USER,
        name: "splat",
        description: "splat",
        required: true
      }
    ]
  },
  /**
 * Sets the response to be ephemeral, so only the command user sees the replies.
 */
  flags: MessageFlags.Ephemeral,

  /**
 * The main execution logic for the command.
 * @param {any} APOLLYON - The main application instance.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction object from discord.js.
 */
  run: async (APOLLYON, interaction) => {
    // Guard clause: Ensure the command is run in a server (guild).
    if (!interaction.guild) return interaction.followUp("You need to run the command in the server the user is talking in!");

    // Get the user object from the command options.
    const userID = interaction.options.get("splat", true);
    if (!userID.user) return interaction.followUp("Failed to get user!");

    // Fetch the full GuildMember object for the targeted user.
    const user = interaction.guild.members.cache.get(userID.user.id) as GuildMember;


    // Guard clause: Check if the targeted user is actually in a voice channel.
    if (!user.voice.channelId) return interaction.followUp("That user seems to not be in a voice call!");

    // The bot joins the <target user's> current voice channel.
    const connection = joinVoiceChannel({
      channelId: user.voice.channelId,
      guildId: user.voice.guild.id,
      adapterCreator: user.voice.guild.voiceAdapterCreator
    });

    // An audio player is created.
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause
      }
    });


    // An audio resource is created from a local MP3 file.
    const resource = createAudioResource(`${process.cwd().replaceAll("\\", "/")}/rahh.mp3`);
    player.play(resource);

    // Subscribe the voice connection to the player to broadcast the audio.
    const subscription = connection.subscribe(player);

    // Set up an event listener for when the player becomes idle (finishes playing).
    player.on(AudioPlayerStatus.Idle, () => {
      // Clean up resources to prevent memory leaks and lingering connections.
      subscription?.unsubscribe();
      connection.destroy();
      interaction.followUp("splat");
    });

    return;
  }
}

export default SPLAT;
