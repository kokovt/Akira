import dotenv from "dotenv";
import handleDiscord from "./Discord";
import handleElectron from "./electron";

/**
 * @file Main Application Entry Point
 * @summary This is the root file that starts the entire application.
 * @description It performs the initial setup by loading environment variables,
 * calculating a reliable base directory path, and then conditionally launching
 * the Electron GUI and/or the Discord bot based on the configuration found
 * in the `.env` file.
 */

// This loads all variables from the `.env` file into the `process.env` object.
// It's the first step to ensure all subsequent modules have access to necessary configuration.
dotenv.config();

// This calculates the project's root directory in a platform-agnostic way.
// It takes the current file's directory (`__dirname`), normalizes path separators
// to forward slashes (to handle Windows paths), and then moves up one level.
const baseDir = __dirname.replaceAll("\\", "/").split("/").slice(0, __dirname.replaceAll("\\", "/").split("/").length - 1).join("/");

/**
 * @summary A getter function for the application's base directory.
 * @description Encapsulating basedir so it isn't exposed globally, and more consistent access.
 * @returns {string} The calculated absolute path to the project's root directory.
 */
export function getBaseDir(): string {
  return baseDir;
}

// The Electron application is launched unconditionally. This is the primary
// graphical user interface for the application.
handleElectron();

// The Discord bot functionality is optional and controlled by an environment variable.
// This allows the application to run as a standalone desktop app without a Discord component.
if (process.env.USE_DISCORD?.toLowerCase() == "y") {
  handleDiscord();
}
