export default {
    terminalCommand: () => {
        console.log("exiting!");
        process.exit(0);
    },
    helpFunction: () => {
        return "Exits the application.";
    },
    name: "exit"
}