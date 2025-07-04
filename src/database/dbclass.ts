import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { glob } from "glob";
import { readFileSync } from "fs";

/**
 * @class DATABASE
 * @summary A simple file-system-based database handler.
 * @description This class provides a structured way to interact with a database
 * stored on the local filesystem. It organizes data into "collections" (which are
 * directories) and "entries" (which are individual JSON files within those directories).
 */
export default class DATABASE {
  /**
 * The root path for the database directory.
 * @type {string}
 */
  path: string = process.cwd().replaceAll("\\", "/") + "/database"

  /**
 * Initializes the DATABASE class.
 * Ensures that the root database directory exists, creating it if necessary.
 */
  constructor() {
    // This is to make sure that the path exists.
    if (!existsSync(this.path)) mkdirSync(this.path);
  }

  /**
 * Retrieves a list of all entry file paths within a specific collection.
 * @param name - The name of the collection (directory) to search within.
 * @returns A promise that resolves to an array of full file paths for each JSON entry.
 */
  async getCollection(name: string): Promise<Array<string>> {
    const files: Array<string> = await glob(`${this.path}/${name}/**/*.json`);
    return files;
  }

  /**
 * Creates a new collection (directory) in the database.
 * @param name - The name of the collection to create.
 * @returns `true` if the collection was created successfully, `false` otherwise.
 */
  createCollection(name: string): boolean {
    try {
      mkdirSync(`${this.path}/${name}`);
      return true;
    } catch (err) {
      return false;
    }
  }


  /**
   * Deletes an entire collection and all its contents.
   * @warning This is a destructive operation and cannot be undone.
   * @param name - The name of the collection to delete.
   * @returns `true` if the collection was deleted successfully, `false` otherwise.
   */
  deleteCollection(name: string): boolean {
    try {
      rmSync(`${this.path}/${name}`, { recursive: true, force: true });
      return true;
    }
    catch (err) {
      return false;
    }
  }

  /**
 * Creates a new, empty JSON entry within a specified collection.
 * @param collection - The name of the collection to add the entry to.
 * @param entryName - The name of the entry file (without the .json extension).
 */
  createEntry(collection: string, entryName: string) {
    writeFileSync(`${this.path}/${collection}/${entryName}.json`, "{}");
  }

  /**
 * Edits an existing entry with new data.
 * The data provided must be a valid JSON string.
 * @param collection - The name of the collection containing the entry.
 * @param entryName - The name of the entry to edit.
 * @param data - A string of valid JSON to write to the entry file.
 * @returns `true` if the entry was edited successfully, `false` if the data is
 * invalid JSON or a file system error occurs.
 */
  editEntry(collection: string, entryName: string, data: string): boolean {
    try {
      JSON.parse(data);
    } catch (err) {
      return false;
    }

    // If valid, write the data to the file.
    try {
      writeFileSync(`${this.path}/${collection}/${entryName}.json`, data);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
 * Retrieves and parses a single entry from a collection.
 * @template T - The expected type of the parsed JSON object.
 * @param collection - The name of the collection containing the entry.
 * @param entryName - The name of the entry to retrieve.
 * @returns The parsed JSON object as type `T`, or `false` if the entry does not exist.
 */
  getEntry<T>(collection: string, entryName: string): T | false {
    const exists = existsSync(`${this.path}/${collection}/${entryName}.json`);

    if (!exists) return false;

    // This assumes the file content is always valid JSON if it exists.
    // TODO: Wrap this in a try-catch incase it is corrupted.
    const fileData: T = JSON.parse(readFileSync(`${this.path}/${collection}/${entryName}.json`).toString());

    return fileData;
  }


  /**
   * Removes a single entry from a collection.
   * @param collection - The name of the collection containing the entry.
   * @param entryName - The name of the entry to remove.
   * @returns `true` if the entry was removed successfully, `false` otherwise.
   */
  removeEntry(collection: string, entryName: string) {
    try {
      rmSync(`${this.path}/${collection}/${entryName}.json`);
      return true;
    } catch {
      return false;
    }
  }
}
