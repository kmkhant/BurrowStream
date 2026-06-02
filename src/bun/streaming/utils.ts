import { networkInterfaces } from "os";
import { join, resolve } from "path";
import logger from "../logger";
import { existsSync, readdirSync } from "fs";

export async function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      if (net.family === "IPv4" && !net.internal) {
        return { ip: net.address };
      }
    }
  }
  return { ip: "localhost" };
}

function getProjectRoot(): string {
  const cwd = process.cwd();

  // If executing inside a macOS app bundle, escape it
  if (cwd.includes(".app/Contents/MacOS")) {
    // Navigates from: /build/dev-macos-arm64/Burrow Stream-dev.app/Contents/MacOS
    // Up 5 levels to reach the true project root folder
    return join(cwd, "..", "..", "..", "..", "..");
  }

  // Fallback for standard terminal execution
  return cwd;
}

export function getPlayerDir(): string {
  const cwd = process.cwd();

  // 1. Package Boundary Detection
  const isPackaged =
    import.meta.dirname.includes("/var/folders") ||
    import.meta.dirname.includes("/tmp") ||
    cwd.includes(".app/Contents/MacOS");

  if (isPackaged) {
    // process.cwd() is: .../Contents/MacOS
    // Navigating via ".." moves up to Contents/
    // From there, target the physical folder path: Resources/app/views/player-dist
    const unpackedProdPath = resolve(
      cwd,
      "..",
      "Resources",
      "app",
      "views",
      "player-dist",
    );

    logger.info(
      `📁 Unpacked environment: Target player folder path -> ${unpackedProdPath}`,
    );
    return unpackedProdPath;
  }

  // 2. Local Development Fallback
  const root = getProjectRoot();
  const devPath = resolve(root, "dist-player");

  if (existsSync(devPath)) {
    logger.info(
      `💻 Development environment: Serving player from -> ${devPath}`,
    );
    return devPath;
  }

  console.error("Path Resolution Debug Failure:", {
    cwd,
    calculatedRoot: root,
    attemptedDev: devPath,
  });

  throw new Error("Player build directory could not be resolved.");
}
