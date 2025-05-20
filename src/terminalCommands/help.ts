import { getCommands } from "../terminal";

export default {
    terminalCommand: () => {
        const COMMANDS = getCommands();
        for(const [key, value] of Object.entries(COMMANDS)) {
            console.log(key + " : " +  value.help_function());
        }
    },

    helpFunction: () => {
        return "Sends information on commands.";
    },
    name: "help"
}