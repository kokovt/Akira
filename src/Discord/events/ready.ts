import { Apollyon } from "..";
import { ActivityType } from "discord.js";
import { glob } from "glob";

export default {
  event: "ready",
  function: async (APOLLYON: Apollyon, ...args: Array<any>) => {
    APOLLYON.CLIENT.user?.setPresence({
      status: "dnd",
      activities: [{
        name: "to Splat",
        type: ActivityType.Listening
      }]
    });

    console.log(`${APOLLYON.CLIENT.user?.displayName} is online!`);

    const FILES = await glob(`${process.cwd().replaceAll("\\", "/")}/dist/Discord/commands/**/*.js`);

    for (let i = 0; i < FILES.length; i++) {
      const COMMAND: any = require(FILES[i]).default;

      if (!COMMAND.interaction.name) continue;

      APOLLYON.commands.push(COMMAND);

      if (APOLLYON.CLIENT.isReady()) {
        APOLLYON.CLIENT.application.commands.create(COMMAND.interaction);
      }
    }
  }
}
