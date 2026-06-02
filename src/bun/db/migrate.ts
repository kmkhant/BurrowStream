import { join } from "path";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { getDB } from "./client";

export async function runMigrations() {
  try {
    const db = getDB();
    let migrationsFolder = "";
    const isPackaged =
      import.meta.dirname.includes("/var/folders") ||
      import.meta.dirname.includes("/tmp");

    if (isPackaged) {
      // Look directly under Resources/drizzle, bypassing the compressed app.asar file entirely
      migrationsFolder = join(process.cwd(), "..", "Resources", "drizzle");
    } else {
      migrationsFolder = join(import.meta.dirname, "..", "..", "drizzle");
    }

    console.log("Running database migrations...");
    console.log("Targeting uncompressed migrationsFolder:", migrationsFolder);

    migrate(db, { migrationsFolder });

    console.log("✅ Database migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}
