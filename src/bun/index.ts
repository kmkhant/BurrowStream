import { mainWindow } from "./windows";
import { runMigrations } from "./db/migrate";
import { checkForUpdates } from "./updater";
import logger from "./logger";

runMigrations();

try {
  await checkForUpdates();
} catch (error) {
  logger.error(error);
}

mainWindow.show();

console.log("Burrow has been started!");
