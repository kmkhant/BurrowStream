import type { Config } from "drizzle-kit";
import { join } from "node:path";

import { getAppDataDir } from "./src/bun/utils/paths";

// For development, use a local SQLite file
const isDev = process.env.NODE_ENV !== "production";

export default {
  schema: "./src/bun/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    // During development, use local file for easier inspection
    // In production, use platform-specific path
    url: isDev
      ? "./data/burrowstream.sqlite"
      : join(getAppDataDir(), "burrowstream.sqlite"),
  },
} satisfies Config;
