import { clearHistory } from "../API/api_controller";

export default {
    terminalCommand: () => {
        clearHistory();
        console.log("History cleared!");
    },
    helpFunction: () => {
        return "Clears the chat history.";
    },
    name: "clearHistory"
}