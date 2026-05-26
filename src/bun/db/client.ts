// src/bun/db/client.ts
import { join } from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { getAppDataDir, ensureDir } from "../utils/paths";
import * as schema from "./schema";

const APP_NAME = "BurrowStream";
const APP_DATA_DIR = getAppDataDir(APP_NAME);
const DATA_DIR = ensureDir(APP_DATA_DIR);
const DB_PATH = join(DATA_DIR, "burrowstream.sqlite");

console.log("APP_DATA_DIR:", APP_DATA_DIR);
console.log("DATA_DIR:", DATA_DIR);
console.log("DB_PATH:", DB_PATH);

const sqlite = new Database(DB_PATH);
sqlite.run("PRAGMA journal_mode=WAL;");
sqlite.run("PRAGMA foreign_keys=ON;");
sqlite.run("PRAGMA synchronous=NORMAL;");
sqlite.run("PRAGMA cache_size=-64000;");

export const db = drizzle(sqlite, { schema });
export const DB_DIR = DATA_DIR;
