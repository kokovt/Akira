import dotenv from "dotenv";

dotenv.config();
import setupExpress from "./API/api_controller";
import handleDiscord from "./Discord";
import handleElectron from "./electron";
const baseDir = __dirname.replaceAll("\\", "/").split("/").slice(0, __dirname.replaceAll("\\", "/").split("/").length - 1).join("/");

export function getBaseDir() {
  return baseDir;
}

// TODO: SETUP WEBSITE
setupExpress();
handleElectron();

if (process.env.USE_DISCORD?.toLowerCase() == "y") {
  handleDiscord();
}
