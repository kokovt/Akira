// src/types/discord.d.ts

// We need to import the original VoiceState type from discord.js
import type { VoiceState } from "discord.js";

declare module "discord.js" {
  // We are augmenting the GuildMember class
  interface GuildMember {
    // Here we add the 'voice' property, making it a readonly VoiceState
    readonly voice: VoiceState;
  }
}
