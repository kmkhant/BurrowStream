import { mainWindow } from "./windows";
import { runMigrations } from "./db/migrate";

runMigrations();

mainWindow.show();

console.log("Burrow has been started!");
