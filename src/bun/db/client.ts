// src/bun/db/client.ts
import { join } from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { getAppDataDir, ensureDir } from "../utils/paths";
import * as schema from "./schema";

const APP_NAME = "BurrowStream";
const DATA_DIR = ensureDir(getAppDataDir(APP_NAME));
const DB_PATH = join(DATA_DIR, "burrowstream.sqlite");

const sqlite = new Database(DB_PATH);
sqlite.run("PRAGMA journal_mode=WAL;");
sqlite.run("PRAGMA foreign_keys=ON;");
sqlite.run("PRAGMA synchronous=NORMAL;");
sqlite.run("PRAGMA cache_size=-64000;");

export const db = drizzle(sqlite, { schema });
export const DB_DIR = DATA_DIR;
