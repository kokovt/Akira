import { GuildMember, MessageFlags } from "discord.js";
import { command } from "../../index"
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior } from "@discordjs/voice";

/**
 * @const {command} BUTTON
 * @summary Defines the `/button` slash command.
 * @description A soundboard-style command. When executed by a user in a voice
 * channel, the bot will join the channel, play a specific sound file ("rahh.mp3"),
 * and then leave.
 */
const BUTTON: command = {
  /**
 * The definition for the slash command to be registered with Discord's API.
 */
  interaction: {
    name: "button",
    description: "button"
  },

  /**
 * Sets the response to be ephemeral. Any text replies will only be visible
 * to the user who ran the command.
 */
  flags: MessageFlags.Ephemeral,

  /**
 * The main execution logic for the command.
 * @param {any} APOLLYON - The main application instance.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction object from discord.js.
 */
  run: async (APOLLYON, interaction) => {
    // Guard clause: Ensure the command is run in a server (guild).
    if (!interaction.guild) return interaction.followUp("This command doesn't work in dms :<");
    // Guard clause: Ensure the interaction member is a valid GuildMember instance.
    if (!(interaction.member instanceof GuildMember)) return interaction.followUp("Failed to get guild information!");

    // Proceed only if the user is in a voice channel.
    if (interaction.member.voice.channelId) {
      // The bot joins the user's current voice channel.
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
      });

      // An audio player is created.
      const player = createAudioPlayer({
        behaviors: {
          // Pauses the player if there are no active subscribers (e.g., if the bot is alone).
          noSubscriber: NoSubscriberBehavior.Pause
        }
      });

      const resource = createAudioResource(`${process.cwd().replaceAll("\\", "/")}/rahh.mp3`);
      player.play(resource);

      // An audio resource is created from a local MP3 file.
      const subscription = connection.subscribe(player);

      // Set up an event listener for when the player becomes idle (i.e., finishes playing).
      player.on(AudioPlayerStatus.Idle, () => {
        // Clean up resources to prevent memory leaks and lingering connections.
        subscription?.unsubscribe();
        connection.destroy();
        interaction.followUp("button");
      })
    } else {
      // If the user is not in a voice channel, inform them.
      interaction.followUp("You need to be in a voice channel to use this!");
    }
    return;
  }
}

export default BUTTON;
