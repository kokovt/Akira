import { GuildMember, MessageFlags } from "discord.js";
import { command, commandOptionTypes } from "../../index"
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior } from "@discordjs/voice";

const SPLAT: command = {
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
  flags: MessageFlags.Ephemeral,

  run: async (APOLLYON, interaction) => {
    if (!interaction.guild) return interaction.followUp("You need to run the command in the server the user is talking in!");

    const userID = interaction.options.get("splat", true);
    if (!userID.user) return interaction.followUp("Failed to get user!");

    const user = interaction.guild.members.cache.get(userID.user.id) as GuildMember;

    if (!user.voice.channelId) return interaction.followUp("That user seems to not be in a voice call!");
    if (!user.voice.guild) return interaction.followUp("Failed to get the guild the user is in!");

    const connection = joinVoiceChannel({
      channelId: user.voice.channelId,
      guildId: user.voice.guild.id,
      adapterCreator: user.voice.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause
      }
    });

    const resource = createAudioResource(`${process.cwd().replaceAll("\\", "/")}/rahh.mp3`);
    player.play(resource);

    const subscription = connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      subscription?.unsubscribe();
      connection.destroy();
      interaction.followUp("splat");
    });

    return;
  }
}

export default SPLAT;
