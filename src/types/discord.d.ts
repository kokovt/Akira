/**
 * @file Type Augmentation for discord.js
 * @summary This file patches the type definitions for the `discord.js` library.
 * @description This is a TypeScript declaration file that uses module augmentation
 * to add the `voice` property to the `GuildMember` interface. At runtime, a
 * `GuildMember` object does have a `.voice` property which holds their voice
 * channel state, but this is not included in the default type definitions provided
 * by `discord.js`.
 *
 * This augmentation makes working with voice-related features (especially with
 * the `@discordjs/voice` library) more type-safe and provides proper IntelliSense,
 * preventing the need for type assertions like `(member as any).voice`.
 */


//! Because of @discordjs/voice we have to do this.
//! This adds the .voice on member thats not there by default for some reason.

import type { VoiceState } from "discord.js";

declare module "discord.js" {
  /**
 * Augments the existing `GuildMember` interface from `discord.js`.
 */
  interface GuildMember {
    /**
 * The voice state for this member.
 * @description Represents the user's state in a voice channel, such as the
 * channel they are in, whether they are muted, deafened, etc.
 * @type {VoiceState}
 * @readonly
 */
    readonly voice: VoiceState;
  }
}
