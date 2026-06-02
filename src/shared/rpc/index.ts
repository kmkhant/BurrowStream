import { BrowserView } from "electrobun";
import { rpcHandlers } from "../../bun/rpc";
import { MainRPC } from "./schema";

export const mainWindowRpc = BrowserView.defineRPC<MainRPC>({
  maxRequestTime: 30000,
  handlers: {
    requests: {
      // Test handlers
      ping: rpcHandlers.ping,
      pingWebview: rpcHandlers.pingWebview,

      // updates handlers
      checkForUpdates: rpcHandlers.checkForUpdates,
      applyDownloadedUpdate: rpcHandlers.applyDownloadedUpdate,

      // system handlers
      getSystemStats: rpcHandlers.getSystemStats,

      // folder handlers
      getFolders: rpcHandlers.getFolders,
      addFolder: rpcHandlers.addFolder,
      removeFolder: rpcHandlers.removeFolder,

      // scanner handlers
      startScan: rpcHandlers.startScan,
      cancelScan: rpcHandlers.cancelScan,

      // streaming handlers
      startServer: rpcHandlers.startServer,
      stopServer: rpcHandlers.stopServer,
      getServerStatus: rpcHandlers.getServerStatus,
    },
    messages: {
      log: ({ msg }) => {
        console.log("[Webview]:", msg);
      },
      scanProgress: (data) => {
        console.log("Scan progress:", data);
      },
      updateStatusChanged: (data) => {
        console.log("Update status changed downstream packet:", data);
      },
    },
  },
});
