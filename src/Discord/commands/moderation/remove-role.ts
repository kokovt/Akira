import { MessageFlags } from "discord.js";
import { command, commandOptionTypes } from "../../index"
const ADDROLE: command = {
    interaction: {
        name: "remove-role",
        description: "Removes a role to a user.",
        options: [{
            name: "user",
            description: "The username of the targeted member",
            type: commandOptionTypes.USER,
            required: true
        }, {
            name: "role",
            description: "The role to remove from the target",
            type: commandOptionTypes.ROLE,
            required: true
        }]
    },
    flags: MessageFlags.Ephemeral,

    run: async (APOLLYON, interaction) => {
        if(!interaction.guild) return interaction.followUp("Failed to get authors data!");

        if(!interaction.memberPermissions?.has("ManageRoles")) return interaction.followUp("You are missing permissions to add roles to others.");

        const user = interaction.options.get("user", true);
        const role = interaction.options.get("role", true);
        
        if(!user.value || !user.user || !role.role) return interaction.followUp("Failed to get data!");

        const targetNember = interaction.guild.members.cache.get(user.user.id);
        console.log(role.role.id);
        targetNember?.roles.remove(role.role.id).catch(() => {});

        interaction.followUp("Removed role to user!");
        return;
    }
}

export default ADDROLE;