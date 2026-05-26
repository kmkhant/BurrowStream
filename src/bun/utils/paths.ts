// src/bun/utils/paths.ts
import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync, mkdirSync } from "node:fs";

export function getAppDataDir(appName: string = "BurrowStream"): string {
  const platform = process.platform;

  switch (platform) {
    case "darwin":
      return join(homedir(), "Library", "Application Support", appName);

    case "win32":
      const appData =
        process.env.APPDATA || join(homedir(), "AppData", "Roaming");
      return join(appData, appName);

    case "linux":
    default:
      // XDG spec
      const xdg =
        process.env.XDG_DATA_HOME || join(homedir(), ".local", "share");
      return join(xdg, appName);
  }
}

export function getConfigDir(appName: string = "BurrowStream"): string {
  const platform = process.platform;

  switch (platform) {
    case "darwin":
      return join(homedir(), "Library", "Preferences", appName);

    case "win32":
      return getAppDataDir(appName); // Windows stores config in AppData too

    case "linux":
    default:
      const xdg = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
      return join(xdg, appName);
  }
}

export function getCacheDir(appName: string = "BurrowStream"): string {
  const platform = process.platform;

  switch (platform) {
    case "darwin":
      return join(homedir(), "Library", "Caches", appName);

    case "win32":
      const localAppData =
        process.env.LOCALAPPDATA || join(homedir(), "AppData", "Local");
      return join(localAppData, appName, "Cache");

    case "linux":
    default:
      const xdg = process.env.XDG_CACHE_HOME || join(homedir(), ".cache");
      return join(xdg, appName);
  }
}

export function ensureDir(dir: string): string {
  // if dev, use local data directory
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  return dir;
}
