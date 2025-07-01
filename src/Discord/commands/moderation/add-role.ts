import { MessageFlags } from "discord.js";
import { command, commandOptionTypes } from "../../index"
const ADDROLE: command = {
  interaction: {
    name: "add-role",
    description: "Adds a role to a user.",
    options: [{
      name: "user",
      description: "The username of the targeted member",
      type: commandOptionTypes.USER,
      required: true
    }, {
      name: "role",
      description: "The role to add to the target",
      type: commandOptionTypes.ROLE,
      required: true
    }]
  },
  flags: MessageFlags.Ephemeral,

  run: async (APOLLYON, interaction) => {
    if (!interaction.guild) return interaction.followUp("Failed to get permission data!");

    if (!interaction.memberPermissions?.has("ManageRoles")) return interaction.followUp("You are missing permissions to add roles to others.");

    const user = interaction.options.get("user", true);
    const role = interaction.options.get("role", true);

    if (!user.value || !user.user || !role.role) return interaction.followUp("Failed to get data!");

    const targetMember = interaction.guild.members.cache.get(user.user.id);;
    targetMember?.roles.add(role.role.id).catch(() => { });

    interaction.followUp("Added role to user!");
    return;
  }
}

export default ADDROLE;
