import { mainWindow } from "./windows";
import { runMigrations } from "./db/migrate";
import { checkForUpdates } from "./updater";
import logger from "./logger";

// Run migrations
runMigrations();

try {
  // Check for updates
  await checkForUpdates();
} catch (error) {
  logger.error(error);
}

// Show the main window
mainWindow.show();

console.log("Burrow has been started!");
