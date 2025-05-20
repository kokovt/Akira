import { getHistory } from "../API/api_controller";

export default {
    terminalCommand: () => {
        console.log(getHistory());
    },
    helpFunction: () => {
        return "Returns data on the history of the chat.";
    },
    name: "getHistory"
}