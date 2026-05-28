import { BrowserView } from "electrobun";
import { rpcHandlers } from "../../bun/rpc/handlers";
import { MainRPC } from "./schema";

export const mainWindowRpc = BrowserView.defineRPC<MainRPC>({
  maxRequestTime: 5000,
  handlers: {
    requests: {
      // Test handlers
      ping: rpcHandlers.ping,

      // system handlers
      getSystemStats: rpcHandlers.getSystemStats,

      // folder handlers
      getFolders: rpcHandlers.getFolders,
      addFolder: rpcHandlers.addFolder,
      removeFolder: rpcHandlers.removeFolder,

      // scanner handlers
      startScan: rpcHandlers.startScan,
      cancelScan: rpcHandlers.cancelScan,
    },
    messages: {
      log: ({ msg }) => {
        console.log("[Webview]:", msg);
      },
      scanProgress: (data) => {
        console.log("Scan progress:", data);
      },
    },
  },
});
