// src/bun/db/client.ts
import { join } from "node:path";
import { drizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { getAppDataDir, ensureDir } from "../utils/paths";
import * as schema from "./schema";

const APP_NAME = "BurrowStream";
const APP_DATA_DIR = getAppDataDir(APP_NAME);
export const DB_DIR = ensureDir(APP_DATA_DIR);
const DB_PATH = join(DB_DIR, "burrowstream.sqlite");

// Internal cached instance to prevent duplicate connections
let internalDbInstance: BunSQLiteDatabase<typeof schema> | null = null;

export function getDB(): BunSQLiteDatabase<typeof schema> {
  // If the instance has already been built, return it immediately
  if (internalDbInstance) {
    return internalDbInstance;
  }

  console.log("Initializing SQLite Driver & Drizzle Core...");
  console.log("APP_DATA_DIR:", APP_DATA_DIR);
  console.log("DATA_DIR:", DB_DIR);
  console.log("DB_PATH:", DB_PATH);

  const sqlite = new Database(DB_PATH);
  sqlite.run("PRAGMA journal_mode=WAL;");
  sqlite.run("PRAGMA foreign_keys=ON;");
  sqlite.run("PRAGMA synchronous=NORMAL;");
  sqlite.run("PRAGMA cache_size=-64000;");

  // Instantiate and cache the Drizzle instance
  internalDbInstance = drizzle(sqlite, { schema });
  return internalDbInstance;
}
