import { MessageFlags } from "discord.js";
import { command, commandOptionTypes } from "../../index"

/**
 * @const {command} REMOVE_ROLE
 * @summary Defines the `/remove-role` slash command.
 * @description An administrative command that allows a user with the necessary
 * permissions to remove a specified role from another member in the server.
 *
 */
const REMOVE_ROLE: command = {
    /**
 * The definition for the slash command to be registered with Discord's API.
 */
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

    /**
 * Sets the response to be ephemeral. This is best practice for administrative
 * commands to keep channels clean and moderation actions discreet.
 */
    flags: MessageFlags.Ephemeral,

    /**
 * The main execution logic for the command.
 * @param {any} APOLLYON - The main application instance.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction object from discord.js.
 */
    run: async (APOLLYON, interaction) => {
        // Guard clause: This command can only be used within a server (guild).
        if (!interaction.guild) return interaction.followUp("Failed to get authors data!");

        // Security check: Ensures the user executing the command has the 'Manage Roles' permission.
        if (!interaction.memberPermissions?.has("ManageRoles")) return interaction.followUp("You are missing permissions to add roles to others.");

        // Retrieve the user and role options provided in the command.
        const user = interaction.options.get("user", true);
        const role = interaction.options.get("role", true);

        // Validate that the options resolved to actual user and role objects.
        if (!user.value || !user.user || !role.role) return interaction.followUp("Failed to get data!");

        // Fetch the target GuildMember object from the server's cache.
        const targetNember = interaction.guild.members.cache.get(user.user.id);

        // Remove the specified role from the target member.
        //TODO: Same issue as add-role. This throws an error everytime, figure that out.
        targetNember?.roles.remove(role.role.id).catch(() => { });

        interaction.followUp("Removed role to user!");
        return;
    }
}

export default REMOVE_ROLE;