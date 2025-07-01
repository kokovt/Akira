import { GuildMember, MessageFlags } from "discord.js";
import { command } from "../../index"
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior } from "@discordjs/voice";

const BUTTON: command = {
  interaction: {
    name: "button",
    description: "button"
  },
  flags: MessageFlags.Ephemeral,

  run: async (APOLLYON, interaction) => {
    if (!interaction.guild) return interaction.followUp("This command doesn't work in dms :<");

    if (!(interaction.member instanceof GuildMember)) return interaction.followUp("Failed to get guild information!");

    if (interaction.member.voice.channelId) {
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
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
        interaction.followUp("button");
      })
    }
    return;
  }
}

export default BUTTON;
