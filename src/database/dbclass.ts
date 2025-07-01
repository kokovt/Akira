import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { glob } from "glob";
import { readFileSync } from "node:original-fs";

export default class DATABASE {
  path: string = process.cwd().replaceAll("\\", "/") + "/database"

  constructor() {
    // This is to make sure that the path exists.
    if (!existsSync(this.path)) mkdirSync(this.path);
  }

  async getCollection(name: string): Promise<Array<string>> {
    const files: Array<string> = await glob(`${this.path}/${name}/**/*.json`);
    return files;
  }

  createCollection(name: string): boolean {
    try {
      mkdirSync(`${this.path}/${name}`);
      return true;
    } catch (err) {
      return false;
    }
  }

  deleteCollection(name: string): boolean {
    try {
      rmSync(`${this.path}/${name}`);
      return true;
    }
    catch (err) {
      return false;
    }
  }

  createEntry(collection: string, entryName: string) {
    writeFileSync(`${this.path}/${collection}/${entryName}.json`, "{}");
  }

  editEntry(collection: string, entryName: string, data: string): boolean {
    try {
      JSON.parse(data);
    } catch (err) {
      return false;
    }

    try {
      writeFileSync(`${this.path}/${collection}/${entryName}.json`, data);
      return true;
    } catch (err) {
      return false;
    }
  }

  getEntry<T>(collection: string, entryName: string): T | false {
    const exists = existsSync(`${this.path}/${collection}/${entryName}.json`);

    if (!exists) return false;

    const fileData: T = JSON.parse(readFileSync(`${this.path}/${collection}/${entryName}.json`).toString());

    return fileData;
  }

  removeEntry(collection: string, entryName: string) {
    try {
      rmSync(`${this.path}/${collection}/${entryName}.json`);
      return true;
    } catch {
      return false;
    }
  }
}
