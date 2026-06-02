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

import { mainWindow } from "../windows";

// test functions
async function ping() {
  return "pong";
}

export async function pingWebview() {
  // @ts-ignore
  mainWindow.webview.rpc?.send.dummyAlert({
    message: "Hello from Bun! You clicked the button.",
    timestamp: Date.now(),
  });
  return { success: true };
}

export const rpcHandlers = {
  // test handlers
  ping,
  pingWebview,

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
