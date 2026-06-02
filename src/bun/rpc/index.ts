// System handlers
import { getSystemStats } from "./handlers/system";

// Folder handlers
import { getFolders, addFolder, removeFolder } from "./handlers/folder";

// Scanner handlers
import { cancelScan, startScan } from "./handlers/scanner";

// Streaming handlers
import { startServer, stopServer, getServerStatus } from "./handlers/streaming";

// updater handlers
import { checkForUpdates, applyDownloadedUpdate } from "../updater";

// test functions
async function ping() {
  return "pong";
}

export const rpcHandlers = {
  // test handlers
  ping,

  // system handlers
  getSystemStats,

  // folder handlers
  getFolders,
  addFolder,
  removeFolder,

  // folder scanners
  startScan,
  cancelScan,

  // streaming handlers
  startServer,
  stopServer,
  getServerStatus,

  // updates
  checkForUpdates,
  applyDownloadedUpdate,
};
