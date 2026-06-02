// src/bun/updater/index.ts
import { Updater } from "electrobun/bun";
import { mainWindowRpc } from "../../shared/rpc";
import logger from "../logger";

function sendStatusToFrontend(
  state: "idle" | "checking" | "available" | "downloading" | "ready" | "error",
  version?: string,
  error?: string,
) {
  // @ts-ignore
  mainWindowRpc.send.updateStatusChanged({
    state,
    version,
    error,
  });
}

export async function checkForUpdates() {
  try {
    const localInfo = await Updater.getLocalInfo();
    const channel = localInfo.channel;

    // if (channel === "dev" || process.env.BUN_ENV === "development") {
    //   logger.info(
    //     "💻 Running in development context. Skipping update sequence.",
    //   );
    //   return;
    // }

    logger.info("🔍 Querying remote release server for updates...");

    sendStatusToFrontend("checking");
    const status = await Updater.checkForUpdate();

    if (status && status.updateAvailable) {
      logger.info(`🚀 Update discovered: Version ${status.version}`);
      sendStatusToFrontend("available", status.version);

      logger.info("📥 Initiating background binary payload extraction...");
      sendStatusToFrontend("downloading", status.version);

      // Await the full network download and verification pass
      await Updater.downloadUpdate();

      // Query the synchronous engine state directly to confirm the binary is staging on disk
      const dynamicInfo = Updater.updateInfo();

      if (dynamicInfo.updateReady) {
        logger.info(
          `📦 Update payload verified and staged on disk for version ${status.version}.`,
        );
        sendStatusToFrontend("ready", status.version);
      } else {
        // Handle anomalies where the file downloaded but hash or signature verification failed
        throw new Error(
          dynamicInfo.error ||
            "Update file downloaded but failed disk staging checks.",
        );
      }
    } else {
      logger.info("✅ Application is completely up to date.");
      sendStatusToFrontend("idle");
    }
  } catch (error) {
    logger.error(
      { error },
      "❌ Failed to complete the update verification sequence",
    );
    sendStatusToFrontend(
      "error",
      undefined,
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function applyDownloadedUpdate() {
  try {
    logger.info("🔄 Applying update and restarting execution thread...");
    await Updater.applyUpdate();
  } catch (error) {
    logger.error({ error }, "❌ Failed to apply binary swap updates");
  }
}
