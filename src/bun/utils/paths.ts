import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync, mkdirSync } from "node:fs";

// Electrobun builds embed code into temporary runtimes or ASAR files.
// Checking if we are executing within a packaged `.app` bundle is much safer.
const isPackaged =
  !process.mainModule?.filename.includes("/src/bun/") &&
  (process.env.NODE_ENV === "production" || !process.env.DATA_PATH);
const isDev = !isPackaged;

// Centralize the fallback to match electrobun.config.ts app.name exactly
const DEFAULT_APP_NAME = "Burrow Stream";

export function getAppDataDir(appName: string = DEFAULT_APP_NAME): string {
  const platform = process.platform;

  // Only use local fallback if explicitly debugging locally with the env var present
  if (isDev && process.env.DATA_PATH) {
    return process.env.DATA_PATH;
  }

  switch (platform) {
    case "darwin":
      return join(homedir(), "Library", "Application Support", appName);

    case "win32":
      return join(
        process.env.APPDATA || join(homedir(), "AppData", "Roaming"),
        appName,
      );

    case "linux":
    default:
      return join(
        process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"),
        appName,
      );
  }
}

export function getConfigDir(appName: string = DEFAULT_APP_NAME): string {
  const platform = process.platform;

  switch (platform) {
    case "darwin":
      // Storing configuration inside Application Support/AppName/Config
      // prevents permission blocks on modern macOS versions
      return join(getAppDataDir(appName), "Config");

    case "win32":
      return getAppDataDir(appName);

    case "linux":
    default:
      return join(
        process.env.XDG_CONFIG_HOME || join(homedir(), ".config"),
        appName,
      );
  }
}

export function getCacheDir(appName: string = DEFAULT_APP_NAME): string {
  const platform = process.platform;

  switch (platform) {
    case "darwin":
      return join(homedir(), "Library", "Caches", appName);

    case "win32":
      return join(
        process.env.LOCALAPPDATA || join(homedir(), "AppData", "Local"),
        appName,
        "Cache",
      );

    case "linux":
    default:
      return join(
        process.env.XDG_CACHE_HOME || join(homedir(), ".cache"),
        appName,
      );
  }
}

export function ensureDir(dir: string): string {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}
